<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

use App\Traits\LogsActivity;

class CategoriaGasto extends Model
{
    use HasFactory, LogsActivity;
    
    protected $table = 'categorias_gastos';

    protected $fillable = ['nombre', 'descripcion', 'estado'];
    
    public function gastos() { return $this->hasMany(Gasto::class, 'categoria_gasto_id'); }
}
