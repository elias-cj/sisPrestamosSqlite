<?php

namespace Database\Seeders;

use App\Models\Usuario;
use App\Models\Rol;
use App\Models\Permiso;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Crear Roles y Permisos básicos
        $adminRole = Rol::firstOrCreate(
            ['nombre' => 'Administrador'],
            ['descripcion' => 'Acceso total al sistema']
        );
        
        $socioRole = Rol::firstOrCreate(
            ['nombre' => 'Socio'],
            ['descripcion' => 'Inversionista con acceso a reportes']
        );
        
        $cobradorRole = Rol::firstOrCreate(
            ['nombre' => 'Cobrador'],
            ['descripcion' => 'Registra pagos y gastos']
        );
        
        $invitadoRole = Rol::firstOrCreate(
            ['nombre' => 'Invitado'],
            ['descripcion' => 'Solo lectura limitada']
        );

        // 2. Crear Usuario Admin
        $admin = Usuario::firstOrCreate(
            ['email' => 'admin@admin.com'],
            [
                'name' => 'Administrador',
                'password' => 'admin',
                'estado' => 'activo',
                'email_verified_at' => now(),
            ]
        );
        
        // Ensure password is correct
        if (!Hash::check('admin', $admin->password)) {
             $admin->password = 'admin';
             $admin->save();
        }

        // 3. Asignar Rol
        if (!$admin->roles()->where('nombre', 'Administrador')->exists()) {
            $admin->roles()->attach($adminRole);
        }
        
        // 4. Crear Empresa por defecto
        \App\Models\Empresa::firstOrCreate(
            ['id' => 1],
            [
                'nombre' => 'Mi Empresa de Préstamos',
                'razon_social' => 'Empresa S.A.',
                'direccion' => 'Ciudad',
                'telefono' => '000000000',
                'email' => 'contacto@empresa.com',
            ]
        );
        
        // 5. Crear Moneda principal
        \App\Models\Moneda::firstOrCreate(
            ['codigo' => 'BOB'],
            [
                'nombre' => 'Boliviano',
                'simbolo' => 'Bs',
                'tipo_cambio' => 1.0000,
                'estado' => 'activo'
            ]
        );
        
        $this->call([
            ClienteSeeder::class,
            SocioSeeder::class,
            CategoriaGastoSeeder::class,
            PermissionSeeder::class,
            LoanSeeder::class,
        ]);
    }
}
