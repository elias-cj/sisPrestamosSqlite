<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [\App\Http\Controllers\PanelController::class, 'index'])->name('dashboard');
    
    // Gestión de Usuarios
    Route::get('users', [\App\Http\Controllers\UsuarioController::class, 'index'])->middleware('permission:ver_usuarios')->name('users.index');
    Route::get('users/create', [\App\Http\Controllers\UsuarioController::class, 'create'])->middleware('permission:crear_usuarios')->name('users.create');
    Route::post('users', [\App\Http\Controllers\UsuarioController::class, 'store'])->middleware('permission:crear_usuarios')->name('users.store');
    Route::get('users/{user}/edit', [\App\Http\Controllers\UsuarioController::class, 'edit'])->middleware('permission:editar_usuarios')->name('users.edit');
    Route::patch('users/{user}', [\App\Http\Controllers\UsuarioController::class, 'update'])->middleware('permission:editar_usuarios')->name('users.update');
    Route::delete('users/{user}', [\App\Http\Controllers\UsuarioController::class, 'destroy'])->middleware('permission:desactivar_usuarios')->name('users.destroy');

    // Roles y Permisos
    Route::resource('roles', \App\Http\Controllers\RolController::class)->middleware('permission:ver_roles');
    
    // Préstamos
    Route::get('loans', [\App\Http\Controllers\PrestamoController::class, 'index'])->middleware('permission:ver_prestamos')->name('loans.index');
    Route::get('loans/create', [\App\Http\Controllers\PrestamoController::class, 'create'])->middleware('permission:crear_prestamos')->name('loans.create');
    Route::post('loans', [\App\Http\Controllers\PrestamoController::class, 'store'])->middleware('permission:crear_prestamos')->name('loans.store');
    Route::get('loans/{loan}', [\App\Http\Controllers\PrestamoController::class, 'show'])->middleware('permission:ver_prestamos')->name('loans.show');
    Route::get('loans/{loan}/edit', [\App\Http\Controllers\PrestamoController::class, 'edit'])->middleware('permission:editar_prestamos')->name('loans.edit');
    Route::patch('loans/{loan}', [\App\Http\Controllers\PrestamoController::class, 'update'])->middleware('permission:editar_prestamos')->name('loans.update');
    
    // Clientes
    Route::resource('clients', \App\Http\Controllers\ClienteController::class)->middleware('permission:ver_clientes');
    
    // Socios
    Route::resource('partners', \App\Http\Controllers\SocioController::class)->middleware('permission:ver_socios');
    
    // Caja
    Route::resource('cash', \App\Http\Controllers\CajaController::class)->middleware('permission:ver_caja');
    
    // Gastos
    Route::resource('expenses', \App\Http\Controllers\GastoController::class)->middleware('permission:ver_gastos');
    Route::resource('expense-categories', \App\Http\Controllers\CategoriaGastoController::class)->middleware('permission:ver_configuracion');
    
    // Pagos
    Route::resource('payments', \App\Http\Controllers\PagoController::class)->middleware('permission:registrar_pago');
    
    // Rutas de Cobro
    Route::get('rutas', [\App\Http\Controllers\RutaController::class, 'index'])->middleware('permission:ver_prestamos')->name('rutas.index');
    Route::post('rutas', [\App\Http\Controllers\RutaController::class, 'store'])->middleware('permission:ruta.administrar')->name('rutas.store');
    Route::patch('rutas/bloquear', [\App\Http\Controllers\RutaController::class, 'toggleBloqueo'])->middleware('permission:ruta.administrar')->name('rutas.toggle-bloqueo');
    Route::patch('rutas/{clienteId}/estado', [\App\Http\Controllers\RutaController::class, 'updateEstado'])->middleware('permission:registrar_pago')->name('rutas.update-estado');
    Route::post('rutas/{clienteId}/ubicacion', [\App\Http\Controllers\RutaController::class, 'storeUbicacion'])->middleware('permission:ruta.gps.capturar')->name('rutas.store-ubicacion');
    Route::delete('rutas/ubicacion/{ubicacionId}', [\App\Http\Controllers\RutaController::class, 'destroyUbicacion'])->middleware('permission:ruta.gps.eliminar')->name('rutas.destroy-ubicacion');
    
    // Monedas
    Route::resource('currencies', \App\Http\Controllers\MonedaController::class)->middleware('permission:ver_configuracion');
    
    // Reportes
    Route::get('reports', [\App\Http\Controllers\ReporteController::class, 'index'])->middleware('permission:ver_reportes')->name('reports.index');
    Route::get('reports/export/excel', [\App\Http\Controllers\ReporteController::class, 'exportExcel'])->middleware('permission:ver_reportes')->name('reports.export.excel');
    Route::get('reports/activity-logs', [\App\Http\Controllers\Settings\AuditoriaController::class, 'index'])->middleware('permission:ver_configuracion')->name('reports.activity-logs');
    Route::get('reports/activity-logs/export', [\App\Http\Controllers\Settings\AuditoriaController::class, 'exportExcel'])->middleware('permission:ver_configuracion')->name('reports.activity-logs.export');
    Route::get('reports/activity-logs/data', [\App\Http\Controllers\Settings\AuditoriaController::class, 'getData'])->middleware('permission:ver_configuracion')->name('reports.activity-logs.data');
    
    Route::get('ranking', [\App\Http\Controllers\RankingController::class, 'index'])->name('ranking.index');

    // Database Settings
});

require __DIR__.'/settings.php';
