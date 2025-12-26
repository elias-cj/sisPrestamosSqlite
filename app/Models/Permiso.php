<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Permiso extends Model
{
    use HasFactory;

    protected $table = 'permissions';

    protected $fillable = ['nombre', 'modulo'];

    public function roles()
    {
        return $this->belongsToMany(Rol::class, 'permission_role', 'permission_id', 'role_id');
    }
}
