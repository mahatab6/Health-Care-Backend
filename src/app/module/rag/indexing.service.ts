import { prisma } from "../../lib/prisma";
import { EmbeddingService } from "./embedding.service";

export class IndexingService {
  private embeddingService: EmbeddingService;

  constructor() {
    this.embeddingService = new EmbeddingService();
  }

  async indexDoctorData() {
    try {
      console.log("Fetching doctor data for indexing......");
      const doctors = await prisma.doctor.findMany({
        where: { isDeleted: false },
        include: {
          Specialties: {
            include: {
              specialty: true,
            },
          },
          reviews: true,
        },
      });

      let indexCount = 0;

      for (const doctor of doctors) {
        const specialtiesList = doctor.Specialties.map(
          (ds) => ds.specialty.title,
        ).join("\n");

        const reviewsText = doctor.reviews.map(
          (r) =>
            `- Rating: ${r.rating}/5. Comment: ${r.comment} || "No comment"`,
        );

        const content = `Doctor Name: ${doctor.name}
            Experience: ${doctor.experience} years
            Qualification: ${doctor.qualification}
            Designation: ${doctor.designation}
            Appointment Fee: $${doctor.appointmentFee}
            Current Working Place: ${doctor.currentWorkingPlace}
            Average Rating: ${doctor.averageRating}/5
            Specialties: ${specialtiesList || "None listed"}
            Patient Reviews:${reviewsText || "No reviews yet."}`;


        const metadata = {
          doctorId: doctor.id,
          name: doctor.name,
          specialties: doctor.Specialties.map((ds) => ds.specialty.title),
          averageRating: doctor.averageRating,
          experience: doctor.experience,
        };

        const chunkKey = `doctor-${doctor.id}`

        await this.idexDocument(
            chunkKey,
            "DOCTOR",
            doctor.id,
            content,
            doctor.name,
            metadata
        )
        indexCount ++;
      }

       console.log(`Successfully Indexed ${indexedCount} doctors.`);

      return {
        success: true,
        message: `Successfully Indexed ${indexedCount} doctors.`,
        indexedCount,
      };
    } catch (error) {}
  }
}
