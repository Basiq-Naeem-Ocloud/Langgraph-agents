import { IsString, IsOptional, IsEnum } from "class-validator";
import { Express } from 'express';

export enum BotType {
    DOCTOR = 'doctor',
    FIANCE = 'fiance',
}

export class CreateAiDto {
    @IsString()
    @IsOptional()
    message?: string;

    @IsOptional()
    document?: Express.Multer.File;

    @IsOptional()
    image?: Express.Multer.File;

    @IsOptional()
    @IsEnum(BotType)
    botType?: BotType;
}


