// This file was auto-generated by prisma-generator-typescript-interfaces

export type CapacityUnit = "TONNES" | "METRES_CUBED" | "KILOGRAMS" | "LITRES" | "KVA";

export type EquipmentCategory = "TRAILER" | "CRANE" | "EXCAVATOR" | "DOZER" | "WEIGH_BRIDGE" | "TELEMATICS_DEVICE" | "VEHICLE" | "CRUSHER" | "MILL" | "LOADER" | "GENERATOR";

export type AnswerType = "TEXT" | "BOOLEAN" | "CHOICE" | "FILE_UPLOAD";

export type ExecutionStatus = "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type JobPriority = "HIGH" | "MEDIUM" | "LOW";

export type JobStatus = "PENDING" | "PLANNED" | "BLOCKED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type JobType = "COLLECT_INTERNAL_SANDS" | "COLLECT_EXTERNAL_SANDS" | "COLLECT_INTERNAL_ORES" | "COLLECT_EXTERNAL_ORES";

export type Permission = "CREATE_USER" | "READ_USER" | "UPDATE_USER" | "DELETE_USER" | "CREATE_CLIENT" | "READ_CLIENT" | "UPDATE_CLIENT" | "DELETE_CLIENT" | "MANAGE_ROLES" | "CREATE_JOB" | "READ_JOB" | "UPDATE_JOB" | "DELETE_JOB" | "CREATE_MAINTENANCE" | "READ_MAINTENANCE" | "UPDATE_MAINTENANCE" | "DELETE_MAINTENANCE" | "VIEW_ASSIGNMENTS" | "CREATE_ASSIGNMENT" | "READ_ASSIGNMENT" | "UPDATE_ASSIGNMENT" | "DELETE_ASSIGNMENT" | "CREATE_EQUIPMENT" | "READ_EQUIPMENT" | "UPDATE_EQUIPMENT" | "DELETE_EQUIPMENT";

export type ProcedureType = "STANDARD" | "START_OF_DAY" | "END_OF_DAY" | "EXCEPTION";

export type QuestionType = "TEXT" | "TEXT_AREA" | "BOOLEAN" | "RADIO" | "RADIO_GROUP" | "IMAGE_PICKER" | "SIGNATURE" | "DATE_PICKER" | "DATE_TIME_PICKER";

export type Role = "ADMINISTRATOR" | "TRANSPORT_MANAGER" | "AGENT" | "DRIVER" | "CLIENT_MANAGER" | "WORKSHOP_MANAGER";

export type SiteClassification = "GREEN" | "ORANGE" | "RED";

export type EquipmentStatus = "AVAILABLE" | "IN_TRANSIT" | "IN_USE" | "UNDER_MAINTENANCE" | "OUT_OF_SERVICE";

export type ClientStatus = "ACTIVE" | "INACTIVE";

export type PlanStatus = "DRAFT" | "PUBLISHED" | "COMPLETED" | "CANCELLED";

export interface Area {
  id: string;
  name: string;
  site?: Site;
  siteId: string;
  shafts?: Shaft[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  idNumber: string;
  address: string;
  contactNumber: string[];
  whatsapp: string[];
  createdBy?: User | null;
  createdById: string | null;
  potentialContactNumbers: boolean;
  email: string[];
  createdAt: Date;
  updatedAt: Date;
  shafts?: Shaft[];
  syndicates?: Syndicate[];
  Job?: Job[];
  status: ClientStatus;
}

export interface Exception {
  id: string;
  execution?: Execution;
  executionId: string;
  description: string;
  evidence: JsonValue;
  actionTaken: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Execution {
  id: string;
  procedure?: Procedure;
  procedureId: string;
  user?: User;
  userId: string;
  responses: JsonValue;
  status: ExecutionStatus;
  startTime: Date;
  endTime: Date | null;
  exceptions?: Exception[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Loadbay {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  jobs?: Job[];
  latitude: number | null;
  longitude: number | null;
  siteId: string;
  site?: Site;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  jobType: JobType;
  priority: JobPriority;
  siteClassification: SiteClassification;
  loadbay?: Loadbay | null;
  loadbayId: string | null;
  estimatedTonnage: number | null;
  status: JobStatus;
  assignedDriver?: User | null;
  assignedDriverId: string | null;
  requester?: User | null;
  requesterId: string | null;
  attachments?: JobAttachment[];
  comments?: JobComment[];
  location: string | null;
  completionProof: string | null;
  createdAt: Date;
  updatedAt: Date;
  shaft?: Shaft;
  shaftId: string;
  preferredCollectionTime: string | null;
  client?: Client;
  clientId: string;
  pickedUpAt: Date | null;
  droppedOffAt: Date | null;
  planAssignment?: PlanAssignment[];
}

export interface JobAttachment {
  id: string;
  job?: Job;
  jobId: string;
  fileUrl: string;
  fileType: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobComment {
  id: string;
  job?: Job;
  jobId: string;
  author?: User;
  authorId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Maintenance {
  id: string;
  equipment?: Equipment;
  equipmentId: string;
  description: string;
  startDate: Date;
  endDate: Date | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Procedure {
  id: string;
  name: string;
  description: string;
  type: ProcedureType;
  questions?: Question[];
  executions?: Execution[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: string;
  procedure?: Procedure;
  procedureId: string;
  text: string;
  answerType: AnswerType;
  choices: JsonValue | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  imageUrl: string | null;
  type: QuestionType;
}

export interface RolePermission {
  id: string;
  role: Role;
  permission: Permission;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  user?: User;
}

export interface Shaft {
  id: string;
  name: string;
  area?: Area;
  areaId: string;
  latitude: number | null;
  longitude: number | null;
  createdAt: Date;
  updatedAt: Date;
  client?: Client;
  clientId: string;
  jobs?: Job[];
}

export interface Syndicate {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  clients?: Client[];
}

export interface Site {
  id: string;
  name: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
  areas?: Area[];
  Loadbay?: Loadbay[];
}

export interface Telematics {
  id: string;
  equipment?: Equipment;
  equipmentId: string;
  currentLocation: string | null;
  fuelLevel: number | null;
  kilometresTravelled: number;
  tonsRelocated: number | null;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName: string | null;
  idNumber: string | null;
  contactNumber: string | null;
  whatsapp: string | null;
  address: string | null;
  password: string | null;
  authCode: string | null;
  authCodeExpires: Date | null;
  role: Role;
  sessions?: Session[];
  permissions: Permission[];
  createdAt: Date;
  updatedAt: Date;
  assignedJobs?: Job[];
  requestedJobs?: Job[];
  jobComments?: JobComment[];
  executions?: Execution[];
  Client?: Client[];
  createdPlans?: DailyPlan[];
}

export interface Equipment {
  id: string;
  description: string | null;
  category: EquipmentCategory;
  make: string | null;
  model: string | null;
  year: number | null;
  registrationNumber: string | null;
  capacity: number | null;
  capacityUnit: CapacityUnit | null;
  type?: EquipmentType;
  typeId: string;
  status: EquipmentStatus;
  telematics?: Telematics | null;
  maintenanceRecords?: Maintenance[];
  createdAt: Date;
  updatedAt: Date;
  planAssignments?: PlanAssignment[];
}

export interface EquipmentType {
  id: string;
  name: string;
  description: string | null;
  equipment?: Equipment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface VerificationCode {
  id: string;
  email: string;
  code: string;
  expiresAt: Date;
  createdAt: Date;
  type: string | null;
}

export interface DailyPlan {
  id: string;
  date: Date;
  status: PlanStatus;
  createdBy?: User;
  createdById: string;
  assignments?: PlanAssignment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PlanAssignment {
  id: string;
  plan?: DailyPlan;
  planId: string;
  equipment?: Equipment;
  equipmentId: string;
  job?: Job;
  jobId: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

type JsonValue = string | number | boolean | { [key in string]?: JsonValue } | Array<JsonValue> | null;
