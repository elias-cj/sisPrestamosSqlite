<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Traits\LogsActivity;

class ClienteUbicacion extends Model
{
    use HasFactory, LogsActivity;

    protected $table = 'cliente_ubicaciones';

    protected $fillable = [
        'cliente_id',
        'tipo',
        'latitud',
        'longitud',
        'referencia',
        'es_principal'
    ];

    protected $casts = [
        'latitud' => 'decimal:8',
        'longitud' => 'decimal:8',
        'es_principal' => 'boolean'
    ];

    public function cliente()
    {
        return $this->belongsTo(Cliente::class);
    }
}
