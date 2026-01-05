<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\TwoFactorAuthenticationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::get('settings', [\App\Http\Controllers\Settings\SettingsController::class, 'index'])->name('settings.index');

    Route::patch('settings/company', [\App\Http\Controllers\Settings\CompanyController::class, 'update'])->name('company.update'); 
    Route::put('settings/password', [PasswordController::class, 'update'])->name('profile.password.update');
    
    // Keep profile routes if needed manually, but hiding them from sidebar
    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // Database Management Routes
    Route::get('settings/database/backup', [\App\Http\Controllers\Settings\DatabaseController::class, 'backup'])->middleware('permission:editar_configuracion')->name('database.backup');
    Route::post('settings/database/restore', [\App\Http\Controllers\Settings\DatabaseController::class, 'restore'])->middleware('permission:editar_configuracion')->name('database.restore');
    Route::post('settings/database/import', [\App\Http\Controllers\Settings\DatabaseController::class, 'import'])->middleware('permission:editar_configuracion')->name('database.import');
    Route::get('settings/database/template', [\App\Http\Controllers\Settings\DatabaseController::class, 'downloadTemplate'])->middleware('permission:editar_configuracion')->name('database.template');
    // ... other routes ...
});
