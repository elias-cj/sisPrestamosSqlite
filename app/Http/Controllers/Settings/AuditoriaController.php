<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\RegistroActividad;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class AuditoriaController extends Controller
{
    public function index(Request $request)
    {
        $filters = $this->getFilters($request);
        $query = RegistroActividad::with('usuario');
        $this->applyFilters($query, $filters);

        $logs = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('settings/Logs/Index', [
            'logs' => $logs,
            'filters' => $filters
        ]);
    }

    public function exportExcel(Request $request)
    {
        $filters = $this->getFilters($request);
        $query = RegistroActividad::with('usuario');
        $this->applyFilters($query, $filters);
        
        $logs = $query->latest()->get();
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Auditoría');
        
        $headers = ['Fecha', 'Hora', 'Usuario', 'Acción', 'Módulo', 'ID', 'Descripción', 'Dirección IP'];
        $sheet->fromArray($headers, NULL, 'A1');
        $sheet->getStyle('A1:H1')->getFont()->setBold(true);
        
        $row = 2;
        foreach ($logs as $log) {
            $sheet->setCellValue('A' . $row, $log->created_at->format('Y-m-d'));
            $sheet->setCellValue('B' . $row, $log->created_at->format('H:i:s'));
            $sheet->setCellValue('C' . $row, $log->usuario ? $log->usuario->name : 'Sistema');
            $sheet->setCellValue('D' . $row, $log->action);
            $sheet->setCellValue('E' . $row, class_basename($log->model_type));
            $sheet->setCellValue('F' . $row, $log->model_id);
            $sheet->setCellValue('G' . $row, $log->description);
            $sheet->setCellValue('H' . $row, $log->ip_address);
            $row++;
        }
        foreach (range('A', 'H') as $col) $sheet->getColumnDimension($col)->setAutoSize(true);
        
        $fileName = 'Auditoria_' . date('Y-m-d_His') . '.xlsx';
        $writer = new Xlsx($spreadsheet);
        
        return response()->streamDownload(function() use ($writer) {
            $writer->save('php://output');
        }, $fileName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Cache-Control' => 'max-age=0',
        ]);
    }

    public function getData(Request $request)
    {
        $filters = $this->getFilters($request);
        $query = RegistroActividad::with('usuario');
        $this->applyFilters($query, $filters);
        
        return response()->json([
            'logs' => $query->latest()->get()
        ]);
    }

    private function getFilters(Request $request)
    {
        return [
            'from_date' => $request->input('from_date'),
            'to_date' => $request->input('to_date'),
            'from_time' => $request->input('from_time'),
            'to_time' => $request->input('to_time'),
            'search' => $request->input('search'),
        ];
    }

    private function applyFilters($query, $filters)
    {
        if ($filters['from_date']) $query->whereDate('created_at', '>=', $filters['from_date']);
        if ($filters['to_date']) $query->whereDate('created_at', '<=', $filters['to_date']);
        if ($filters['from_time']) $query->whereTime('created_at', '>=', $filters['from_time']);
        if ($filters['to_time']) $query->whereTime('created_at', '<=', $filters['to_time']);
        if ($filters['search']) {
            $query->where(function($q) use ($filters) {
                $q->where('description', 'like', "%{$filters['search']}%")
                  ->orWhere('action', 'like', "%{$filters['search']}%")
                  ->orWhere('model_type', 'like', "%{$filters['search']}%");
            });
        }
    }
}
