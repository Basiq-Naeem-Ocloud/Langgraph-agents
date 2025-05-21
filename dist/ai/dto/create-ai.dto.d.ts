export declare enum BotType {
    DOCTOR = "doctor",
    FIANCE = "fiance",
    DESIGNER = "designer",
    WRITER = "writer",
    LAWYER = "lawyer",
    TECHNICIAN = "technician",
    OTHER = "other"
}
export declare class CreateAiDto {
    message?: string;
    document?: Express.Multer.File;
    image?: Express.Multer.File;
    image2?: string;
    botType?: BotType;
}
