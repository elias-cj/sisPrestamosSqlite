<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Cliente;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\IOFactory;

class DatabaseController extends Controller
{
    /**
     * Backup: Copia directa del archivo SQLite
     */
    public function backup()
    {
        $dbPath = database_path('database.sqlite');
        
        if (!file_exists($dbPath)) {
            return back()->withErrors(['backup' => 'Archivo de base de datos no encontrado.']);
        }

        $filename = 'backup-' . date('Y-m-d-H-i-s') . '.sqlite';
        
        return response()->download($dbPath, $filename, [
            'Content-Type' => 'application/octet-stream',
        ]);
    }

    /**
     * Restore: Reemplaza el archivo SQLite actual
     */
    public function restore(Request $request)
    {
        $request->validate([
            'backup_file' => 'required|file',
        ]);

        $dbPath = database_path('database.sqlite');
        
        try {
            // Crear backup de seguridad antes de restaurar
            if (file_exists($dbPath)) {
                $backupPath = database_path('database.backup.' . date('Y-m-d-H-i-s') . '.sqlite');
                copy($dbPath, $backupPath);
            }

            // Reemplazar con el archivo subido
            $uploadedFile = $request->file('backup_file');
            $uploadedFile->move(database_path(), 'database.sqlite');

            return back()->with('success', 'Base de datos restaurada correctamente. Se creó un respaldo de seguridad.');
        } catch (\Exception $e) {
            return back()->withErrors(['backup_file' => 'Error al restaurar: ' . $e->getMessage()]);
        }
    }

    /**
     * Importar clientes desde Excel/CSV
     */
    public function import(Request $request)
    {
        $request->validate([
            'import_file' => 'required|file|mimes:xlsx,xls,csv',
        ]);

        try {
            $file = $request->file('import_file');
            $spreadsheet = IOFactory::load($file->getPathname());
            $sheet = $spreadsheet->getActiveSheet();
            $rows = $sheet->toArray();

            // Saltar la fila de encabezados
            array_shift($rows);

            $imported = 0;
            $errors = [];

            foreach ($rows as $index => $row) {
                // Validar que tenga al menos nombre y documento
                if (empty($row[0]) || empty($row[1])) {
                    $errors[] = "Fila " . ($index + 2) . ": Nombre y Documento son obligatorios.";
                    continue;
                }

                try {
                    Cliente::updateOrCreate(
                        ['documento' => $row[1]], // Buscar por documento
                        [
                            'nombre' => $row[0],
                            'telefono' => $row[2] ?? null,
                            'direccion' => $row[3] ?? null,
                            'estado_crediticio' => $row[4] ?? 'bueno',
                        ]
                    );
                    $imported++;
                } catch (\Exception $e) {
                    $errors[] = "Fila " . ($index + 2) . ": " . $e->getMessage();
                }
            }

            $message = "Se importaron {$imported} clientes correctamente.";
            if (count($errors) > 0) {
                $message .= " Errores: " . implode(', ', array_slice($errors, 0, 5));
            }

            return back()->with('success', $message);
        } catch (\Exception $e) {
            return back()->withErrors(['import_file' => 'Error al importar: ' . $e->getMessage()]);
        }
    }

    /**
     * Descargar plantilla Excel para importación
     */
    public function downloadTemplate()
    {
        $filename = 'plantilla_clientes.xlsx';
        
        return response()->streamDownload(function () {
            $spreadsheet = new Spreadsheet();
            $sheet = $spreadsheet->getActiveSheet();

            // Encabezados
            $sheet->setCellValue('A1', 'Nombre');
            $sheet->setCellValue('B1', 'Documento');
            $sheet->setCellValue('C1', 'Teléfono');
            $sheet->setCellValue('D1', 'Dirección');
            $sheet->setCellValue('E1', 'Estado Crediticio');

            // Estilo de encabezados
            $sheet->getStyle('A1:E1')->getFont()->setBold(true);
            $sheet->getStyle('A1:E1')->getFill()
                ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
                ->getStartColor()->setARGB('FFE0E0E0');

            // Ejemplo de datos
            $sheet->setCellValue('A2', 'Juan Pérez');
            $sheet->setCellValue('B2', '12345678');
            $sheet->setCellValue('C2', '77123456');
            $sheet->setCellValue('D2', 'Av. Siempre Viva 123');
            $sheet->setCellValue('E2', 'bueno');

            $sheet->setCellValue('A3', 'María García');
            $sheet->setCellValue('B3', '87654321');
            $sheet->setCellValue('C3', '77654321');
            $sheet->setCellValue('D3', 'Calle Falsa 456');
            $sheet->setCellValue('E3', 'regular');

            // Ajustar ancho de columnas
            foreach (range('A', 'E') as $col) {
                $sheet->getColumnDimension($col)->setAutoSize(true);
            }

            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Cache-Control' => 'max-age=0',
        ]);
    }
}
