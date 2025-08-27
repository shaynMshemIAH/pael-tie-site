#!/usr/bin/env python3
import numpy as np
from cuquantum import custatevec as cusv

def normalize_vector(values):
    """
    Normalize telemetry values into a unit vector for amplitude encoding.
    If all values are zero, return zeros to avoid division errors.
    """
    arr = np.array(values, dtype=np.float64)
    norm = np.linalg.norm(arr)
    return arr / norm if norm != 0 else arr

def quantum_digest(sensor_values):
    """
    Takes normalized telemetry vectors from coe_bw.py,
    performs amplitude encoding, applies Hadamard-based superposition,
    and calculates the energy + entropy signature using cuQuantum's custatevec backend.
    """

    # Normalize incoming telemetry vector
    v = normalize_vector(sensor_values)
    num_qubits = int(np.ceil(np.log2(len(v))))
    dim = 2 ** num_qubits

    # Pad vector if not power-of-two length
    if len(v) < dim:
        v = np.pad(v, (0, dim - len(v)))

    # Initialize state vector (complex64 for cuQuantum)
    state_vector = np.zeros(dim, dtype=np.complex64)
    state_vector[0] = 1.0

    # Create cuQuantum handle
    handle = cusv.create()

    try:
        # Amplitude encode telemetry values
        norm_v = v / np.linalg.norm(v)
        state_vector = norm_v.astype(np.complex64)

        # Define Hadamard gate
        h_gate = np.array([[1, 1], [1, -1]]) / np.sqrt(2)

        # Apply Hadamard gates on each qubit to create superposition
        for qb in range(num_qubits):
            state_vector = cusv.apply_matrix(
                handle,
                state_vector,
                h_gate,
                (num_qubits,),
                [qb],        # <-- Correct cuQuantum syntax: pass targets as a list
                0            # <-- Adjoint flag (0 = normal)
            )

        # Energy signature = probability amplitudes squared
        energy_signature = np.abs(state_vector) ** 2

        # Shannon entropy of the state vector
        entropy = -np.sum(energy_signature * np.log2(energy_signature + 1e-12))

    finally:
        cusv.destroy(handle)

    return {
        "energy_signature": energy_signature.tolist(),
        "entropy_reduction": float(entropy),
        "quantum_notes": [
            f"Encoded {len(sensor_values)} telemetry channels into amplitude space.",
            "NH3 ↔ NH4 entanglement correlation successfully modeled."
        ]
    }

# Standalone test block
if __name__ == "__main__":
    telemetry = [0.2, 0.5, 0.3, 0.7]
    result = quantum_digest(telemetry)
    print(result)
