import { Type } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';

export class DateRangeDto {
    @IsDate()
    @Type(() => Date)
    @IsOptional()
    startDate?: Date;

    @IsDate()
    @Type(() => Date)
    @IsOptional()
    endDate?: Date;
}