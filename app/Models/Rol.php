<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rol extends Model
{
    use HasFactory;
    
    protected $table = 'roles';

    protected $fillable = ['nombre', 'descripcion'];

    public function usuarios()
    {
        return $this->belongsToMany(Usuario::class, 'role_user', 'role_id', 'user_id');
    }

    public function users() { return $this->usuarios(); } // Alias

    public function permissions()
    {
        return $this->belongsToMany(Permiso::class, 'permission_role', 'role_id', 'permission_id');
    }
}
