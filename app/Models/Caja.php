<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Traits\LogsActivity;

class Caja extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'usuario_id',
        'fecha',
        'monto_apertura',
        'monto_cierre',
        'total_ingresos',
        'total_egresos',
        'estado',
    ];

    protected $casts = [
        'fecha' => 'date',
        'monto_apertura' => 'decimal:2',
        'monto_cierre' => 'decimal:2',
        'total_ingresos' => 'decimal:2',
        'total_egresos' => 'decimal:2',
    ];

    public function usuario() { return $this->belongsTo(Usuario::class, 'usuario_id'); }
    public function pagos() { return $this->hasMany(Pago::class); }
    public function gastos() { return $this->hasMany(Gasto::class); }
}
