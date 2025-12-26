<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Perdida extends Model
{
    use HasFactory;

    protected $fillable = [
        'prestamo_id',
        'socio_id',
        'monto_perdida',
        'motivo',
    ];
    
    protected $casts = [
        'monto_perdida' => 'decimal:2',
    ];

    public function prestamo() { return $this->belongsTo(Prestamo::class); }
    public function socio() { return $this->belongsTo(Socio::class); }
}
