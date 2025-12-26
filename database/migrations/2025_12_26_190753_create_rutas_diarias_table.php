<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('rutas_diarias', function (Blueprint $table) {
            $table->id();
            $table->date('fecha')->index();
            $table->json('orden')->nullable(); // Array de clientes ordenados con estados
            $table->boolean('bloqueada')->default(false);
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            // Índice único por fecha y usuario
            $table->unique(['fecha', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rutas_diarias');
    }
};
