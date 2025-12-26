<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
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
        $adminRole = Role::firstOrCreate(
            ['nombre' => 'Administrador'],
            ['descripcion' => 'Acceso total al sistema']
        );
        
        $socioRole = Role::firstOrCreate(
            ['nombre' => 'Socio'],
            ['descripcion' => 'Inversionista con acceso a reportes']
        );
        
        $cobradorRole = Role::firstOrCreate(
            ['nombre' => 'Cobrador'],
            ['descripcion' => 'Registra pagos y gastos']
        );
        
        $invitadoRole = Role::firstOrCreate(
            ['nombre' => 'Invitado'],
            ['descripcion' => 'Solo lectura limitada']
        );

        // 2. Crear Usuario Admin
        $admin = User::firstOrCreate(
            ['email' => 'admin@admin.com'], // Using a standard email, user said "admin admin" likely meaning username/password, but standard auth uses email. I'll set email to 'admin' if possible? No, Laravel validation usually requires email. I will try to support 'admin' as login if I can, but standard is email. I'll set email to admin@admin.com and password to admin. User said "quiero admin admin".
            [
                'name' => 'Administrador',
                'password' => 'admin', // Will be hashed by mutator or we force hash here. Standard User model casts password to hashed, but firstOrCreate might bypass cast if passed as array? No, casts work on model set. But `create` or `firstOrCreate` with array... let's be safe.
                'estado' => 'activo',
                'email_verified_at' => now(),
            ]
        );
        
        // Ensure password is correct (in case it existed)
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
            ['codigo' => 'USD'],
            [
                'nombre' => 'Dólar Estadounidense',
                'simbolo' => '$',
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
