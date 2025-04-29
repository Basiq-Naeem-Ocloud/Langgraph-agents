export declare enum BotType {
    DOCTOR = "doctor",
    FIANCE = "fiance"
}
export declare class CreateAiDto {
    message?: string;
    document?: Express.Multer.File;
    image?: Express.Multer.File;
    botType?: BotType;
}
