<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Permission;
use App\Models\Role;

class PermissionSeeder extends Seeder
{
    public function run()
    {
        $permissions = [
            // Usuarios
            ['nombre' => 'ver_usuarios', 'modulo' => 'usuarios'],
            ['nombre' => 'crear_usuarios', 'modulo' => 'usuarios'],
            ['nombre' => 'editar_usuarios', 'modulo' => 'usuarios'],
            ['nombre' => 'desactivar_usuarios', 'modulo' => 'usuarios'], // Instead of delete
            
            // Roles y Permisos
            ['nombre' => 'ver_roles', 'modulo' => 'seguridad'],
            ['nombre' => 'crear_roles', 'modulo' => 'seguridad'],
            ['nombre' => 'editar_roles', 'modulo' => 'seguridad'],
            
            // Clientes
            ['nombre' => 'ver_clientes', 'modulo' => 'clientes'],
            ['nombre' => 'crear_clientes', 'modulo' => 'clientes'],
            ['nombre' => 'editar_clientes', 'modulo' => 'clientes'],
            ['nombre' => 'eliminar_clientes', 'modulo' => 'clientes'],
            
            // Socios
            ['nombre' => 'ver_socios', 'modulo' => 'socios'],
            ['nombre' => 'crear_socios', 'modulo' => 'socios'],
            ['nombre' => 'editar_socios', 'modulo' => 'socios'],
            
            // Préstamos
            ['nombre' => 'ver_prestamos', 'modulo' => 'prestamos'],
            ['nombre' => 'crear_prestamos', 'modulo' => 'prestamos'],
            ['nombre' => 'aprobar_prestamos', 'modulo' => 'prestamos'],
            ['nombre' => 'anular_prestamos', 'modulo' => 'prestamos'],
            
            // Caja y Pagos
            ['nombre' => 'ver_caja', 'modulo' => 'caja'],
            ['nombre' => 'abrir_caja', 'modulo' => 'caja'],
            ['nombre' => 'cerrar_caja', 'modulo' => 'caja'],
            ['nombre' => 'registrar_pago', 'modulo' => 'pagos'],
            ['nombre' => 'anular_pago', 'modulo' => 'pagos'],
            
            // Gastos
            ['nombre' => 'ver_gastos', 'modulo' => 'gastos'],
            ['nombre' => 'registrar_gasto', 'modulo' => 'gastos'],
            
            // Reportes
            ['nombre' => 'ver_reportes', 'modulo' => 'reportes'],
            
            // Configuración
            ['nombre' => 'ver_configuracion', 'modulo' => 'configuracion'],
            ['nombre' => 'editar_configuracion', 'modulo' => 'configuracion'],
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate($perm);
        }

        // Asignar TODO al Admin
        $adminRole = Role::where('nombre', 'Administrador')->first();
        if ($adminRole) {
            $allPermissions = Permission::all();
            $adminRole->permissions()->sync($allPermissions);
        }

        // Asignar permisos al Cobrador
        $cobradorRole = Role::where('nombre', 'Cobrador')->first();
        if ($cobradorRole) {
            $cobradorPermissions = Permission::whereIn('modulo', ['clientes', 'prestamos', 'caja', 'pagos', 'gastos'])->get();
            $cobradorRole->permissions()->sync($cobradorPermissions);
        }
        
        // Asignar permisos al Socio (Limitado)
        $socioRole = Role::where('nombre', 'Socio')->first();
        if ($socioRole) {
            // Socios can see reports and loans mainly
             $socioPermissions = Permission::whereIn('nombre', ['ver_reportes', 'ver_prestamos', 'ver_socios'])->get();
             $socioRole->permissions()->sync($socioPermissions);
        }
    }
}
