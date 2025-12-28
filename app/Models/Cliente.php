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
        'zona',
        'estado'
    ];

    public function prestamos()
    {
        return $this->hasMany(Prestamo::class);
    }

    public function ubicaciones()
    {
        return $this->hasMany(ClienteUbicacion::class);
    }
}
