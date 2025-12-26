<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Empresa extends Model
{
    use HasFactory;

    protected $fillable = [
        'nombre',
        'razon_social',
        'direccion',
        'telefono',
        'email',
        'moneda_defecto_id',
        'logo',
    ];
    
    public function monedaDefecto()
    {
        return $this->belongsTo(Moneda::class, 'moneda_defecto_id');
    }
}
