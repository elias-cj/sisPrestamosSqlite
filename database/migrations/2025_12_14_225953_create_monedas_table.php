<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('monedas', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('simbolo');
            $table->string('codigo');
            $table->decimal('tipo_cambio', 10, 4)->default(1);
            $table->string('estado')->default('activo');
            $table->timestamps();
        });
        
        // Add constraint to empresas if it exists (Optional, or separate migration)
        // Leaving it de-coupled for now to avoid migration order issues.
    }

    public function down(): void
    {
        Schema::dropIfExists('monedas');
    }
};
