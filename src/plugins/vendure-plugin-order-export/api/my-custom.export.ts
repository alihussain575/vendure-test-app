import { promises as fs } from 'fs';
import { createObjectCsvWriter } from 'csv-writer';
import { ExportInput, ExportStrategy } from './export-strategy';

export class MyCustomExport implements ExportStrategy {
    // Name as shown in the admin UI
    readonly name = 'my-custom-export';
    // Content-type of your export file
    readonly contentType = 'text/csv';
    // File extension of your export file
    readonly fileExtension = 'csv';

    async createExportFile({
        ctx,
        startDate,
        endDate,
        orderService,
    }: ExportInput): Promise<string> {
        const orders = await orderService.findAll(
            ctx,
            {
                filter: {
                    orderPlacedAt: {
                        between: {
                            start: startDate,
                            end: endDate,
                        },
                    },
                },
            },
            ['lines.productVariant']
        );
        // Do your magic with the order data here
        const filePath = '/tmp/your-temp-file.csv';
        // const csvWriter = createObjectCsvWriter({ path: filePath });
        // await csvWriter.writeRecords({ data: 'your custom data' });
        return filePath;
    }
}