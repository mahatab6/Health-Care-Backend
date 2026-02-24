import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import { PaymentStatus } from "../../../generated/prisma/enums";
import { uploadFileToCloudinary } from "../../../config/cloudinary.config";
import { sendEmail } from "../../utils/email";
import { generateInvoicePdf } from "./payment.utils";

const handlerStripeWebhookEvent = async (event: Stripe.Event) => {
  const existingPayment = await prisma.payment.findFirst({
    where: {
      stripeEventId: event.id,
    },
  });

  if (existingPayment) {
    console.log(`Event ${event.id} already processed. Skipping`);
    return { message: `Event ${event.id} already processed` };
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;

      const appointmentId = session.metadata?.appointmentId;

      const paymentId = session.metadata?.paymentId;

      if (!appointmentId || !paymentId) {
        console.error("Missing appointmentID or payment in session metadata");
        return {
          message: "Missing appointmentID or payment in session metadata",
        };
      }

      const appointment = await prisma.appointment.findUnique({
        where: {
          id: appointmentId,
        },
        include: {
          payment: true,
          patient: true,
          doctor: true,
          schedule: true,
        },
      });

      if (!appointment) {
        console.error(`Appointment with id ${appointmentId} not found`);
        return { message: `Appointment with id ${appointmentId} not found` };
      }

      await prisma.$transaction(async (tx) => {
        await tx.appointment.update({
          where: {
            id: appointmentId,
          },
          data: {
            paymentStatus:
              session.payment_status === "paid"
                ? PaymentStatus.PAID
                : PaymentStatus.UNPAID,
          },
        });
      });

      if (session.payment_status === "paid") {
        try {
          const pdfBuffer = await generateInvoicePdf({
            invoiceId: appointment.payment?.id || paymentId,
            patientName: appointment.patient.name,
            patientEmail: appointment.patient.email,
            doctorName: appointment.doctor.name,
            appointmentDate: appointment.schedule.startDateTime.toString(),
            amount: appointment.payment?.amount || 0,
            transactionId: appointment.payment?.transactionId || "",
            paymentDate: new Date().toISOString(),
          });

          const uploadFile = await uploadFileToCloudinary(
            pdfBuffer,
            `ph-healthcare/invoices/invoice-${paymentId}-${Date.now()}.pdf`,
          );
          console.log(uploadFile)
          const invoiceUrl = uploadFile?.secure_url;

          const updatedPayment = await prisma.payment.update({
            where: {
              id: paymentId,
            },
            data: {
              stripeEventId: event.id,
              status:
                session.payment_status === "paid"
                  ? PaymentStatus.PAID
                  : PaymentStatus.UNPAID,
              paymentGatewayData: session as any,
              invoiceUrl: invoiceUrl,
            },
          });

          await sendEmail({
            to: appointment.patient.email,
            subject: `Payment Confirmation & Invoice - Appointment with ${appointment.doctor.name}`,
            templateName: "invoice",
            templateData: {
              patientName: appointment.patient.name,
              invoiceId: appointment.payment?.id || paymentId,
              transactionId: appointment.payment?.transactionId || "",
              paymentDate: new Date().toLocaleDateString(),
              doctorName: appointment.doctor.name,
              appointmentDate: new Date(
                appointment.schedule.startDateTime,
              ).toLocaleDateString(),
              amount: appointment.payment?.amount || 0,
              invoiceUrl: invoiceUrl,
            },
            attachments: [
              {
                filename: `Invoice-${paymentId}.pdf`,
                content: pdfBuffer,
                contentType: "application/pdf",
              },
            ],
          });

          console.log(`✅ Invoice email sent to ${appointment.patient.email}`);
        } catch (error) {
          console.error("Error generating/uploading invoice PDF:", error);
        }
      }

      console.log(
        `Processed checkout.session.completed for appointment ${appointmentId} and payment ${paymentId}`,
      );
      break;
    }
    case "checkout.session.expired": {
      const session = event.data.object;

      console.log(
        `Checkout session ${session.id} expired. Marking associated payment as failed.`,
      );
      break;
    }

    case "payment_intent.payment_failed": {
      const session = event.data.object;

      console.log(
        `Payment intent ${session.id} failed. Marking associated payment as failed.`,
      );
      break;
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return { message: `Webhook Event ${event.id} processed successfully` };
};

export const PaymentService = {
  handlerStripeWebhookEvent,
};
