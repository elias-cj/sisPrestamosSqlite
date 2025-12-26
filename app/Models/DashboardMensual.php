<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DashboardMensual extends Model
{
    use HasFactory;
    
    protected $table = 'dashboard_mensual';

    protected $fillable = [
        'mes',
        'anio',
        'total_prestado',
        'total_cobrado',
        'ganancias',
        'gastos',
        'perdidas',
        'utilidad_neta',
        'prestamos_activos',
    ];
    
    protected $casts = [
        'total_prestado' => 'decimal:2',
        'total_cobrado' => 'decimal:2',
        'ganancias' => 'decimal:2',
        'gastos' => 'decimal:2',
        'perdidas' => 'decimal:2',
        'utilidad_neta' => 'decimal:2',
    ];
}
