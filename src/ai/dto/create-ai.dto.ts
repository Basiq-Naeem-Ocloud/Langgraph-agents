import { IsString, IsOptional } from "class-validator";
import { Express } from 'express';

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

    @IsString()
    @IsOptional()
    sessionId?: string;
}


