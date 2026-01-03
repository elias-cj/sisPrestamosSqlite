<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Empresa;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class CompanyController extends Controller
{
    public function edit()
    {
        $company = Empresa::firstOrFail(); // Should exist from seeder
        
        return Inertia::render('settings/company', [
            'company' => $company,
            'status' => session('status'),
        ]);
    }

    public function update(Request $request)
    {
        $company = Empresa::firstOrFail();
        
        $validated = $request->validate([
            'nombre' => 'required|string|max:255',
            'razon_social' => 'required|string|max:255',
            'direccion' => 'required|string|max:255',
            'telefono' => 'required|string|max:20',
            'email' => 'required|email|max:255',
            'logo' => 'nullable|mimes:jpg,jpeg,png,webp,svg,pdf|max:2048',
            'qr_pago' => 'nullable|mimes:jpg,jpeg,png,webp|max:2048',
            'qr_vencimiento' => 'nullable|date',
        ]);

        if ($request->hasFile('logo')) {
            // Delete old logo if exists
            if ($company->logo) {
                Storage::disk('public')->delete($company->logo);
            }
            
            $path = $request->file('logo')->store('logos', 'public');
            $validated['logo'] = $path;
        }

        if ($request->hasFile('qr_pago')) {
            // Delete old QR if exists
            if ($company->qr_pago) {
                Storage::disk('public')->delete($company->qr_pago);
            }
            
            $path = $request->file('qr_pago')->store('qrs', 'public');
            $validated['qr_pago'] = $path;
        }

        $company->update($validated);

        return back()->with('status', 'config-updated');
    }
}
