<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('perdidas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('prestamo_id')->constrained();
            $table->foreignId('socio_id')->constrained();
            $table->decimal('monto_perdida', 20, 2);
            $table->string('motivo')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('perdidas');
    }
};
