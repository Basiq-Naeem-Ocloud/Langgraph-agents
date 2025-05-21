import { IsString, IsOptional, IsEnum } from "class-validator";
import { Express } from 'express';

export enum BotType {
    DOCTOR = 'doctor',
    FIANCE = 'fiance',
    DESIGNER = 'designer',
    WRITER = 'writer',
    LAWYER = 'lawyer',
    TECHNICIAN = 'technician',
    OTHER = 'other',
}

export class CreateAiDto {
    @IsString()
    @IsOptional()
    message?: string;

    @IsOptional()
    document?: Express.Multer.File;

    @IsOptional()
    image?: Express.Multer.File;

    @IsString()
    @IsOptional()
    image2?: string;

    @IsOptional()
    @IsEnum(BotType)
    botType?: BotType;
}


