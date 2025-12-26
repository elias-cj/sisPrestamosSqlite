<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cuota extends Model
{
    use HasFactory;

    protected $fillable = [
        'prestamo_id',
        'numero_cuota',
        'fecha_programada',
        'monto',
        'estado',
    ];
    
    protected $casts = [
        'fecha_programada' => 'date',
        'monto' => 'decimal:2',
    ];

    public function prestamo()
    {
        return $this->belongsTo(Prestamo::class);
    }
    
    public function pagos()
    {
        return $this->hasMany(Pago::class);
    }
}
