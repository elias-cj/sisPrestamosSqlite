<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Traits\LogsActivity;

class Moneda extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'nombre',
        'simbolo',
        'codigo',
        'tipo_cambio',
        'estado',
    ];

    public function prestamos()
    {
        return $this->hasMany(Prestamo::class);
    }
}
