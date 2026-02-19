import { Router } from "express";
import { SpecialtyRoutes } from "../module/specialty/specialty.route";
import { AuthRoutes } from "../module/auth/auth.route";
import { UserRoutes } from "../module/user/user.route";
import { doctorRoutes } from "../module/doctor/doctor.route";
import { adminRoutes } from "../module/admin/admin.route";
import { scheduleRoutes } from "../module/schedule/schedule.route";
import { DoctorScheduleRoutes } from "../module/doctorSchedule/doctorSchedule.route";

const router = Router();

router.use("/auth", AuthRoutes)

router.use("/specialties", SpecialtyRoutes)

router.use("/users", UserRoutes)

router.use("/doctors", doctorRoutes)

router.use('/admin', adminRoutes)

router.use('/schedules', scheduleRoutes)

router.use('/doctor-schedules', DoctorScheduleRoutes)

export const IndexRoutes = router;