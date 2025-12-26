<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cliente extends Model
{
    use HasFactory;

    protected $fillable = [
        'nombre',
        'documento',
        'telefono',
        'direccion',
        'estado_crediticio',
    ];

    public function prestamos()
    {
        return $this->hasMany(Prestamo::class);
    }
}
