<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Traits\LogsActivity;

class Gasto extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'categoria_gasto_id',
        'descripcion',
        'monto',
        'moneda_id',
        'fecha',
        'usuario_id',
        'caja_id',
        'estado',
    ];

    protected $casts = [
        'fecha' => 'date',
        'monto' => 'decimal:2',
    ];

    public function categoria() { return $this->belongsTo(CategoriaGasto::class, 'categoria_gasto_id'); }
    public function usuario() { return $this->belongsTo(Usuario::class, 'usuario_id'); }
    public function caja() { return $this->belongsTo(Caja::class); }
    public function moneda() { return $this->belongsTo(Moneda::class); }
}
