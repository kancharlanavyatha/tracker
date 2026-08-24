"""
Train a PyTorch LSTM model for sequential menstrual cycle phase classification.

Produces: backend/artifacts/lstm_phase.pth
"""

from __future__ import annotations

import sys
from pathlib import Path
import joblib
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))


class CycleLSTMClassifier(nn.Module):
    def __init__(self, seq_in_dim=2, hidden_dim=16, static_in_dim=2, output_dim=4):
        super().__init__()
        self.lstm = nn.LSTM(seq_in_dim, hidden_dim, batch_first=True)
        self.fc1 = nn.Linear(hidden_dim + static_in_dim, 16)
        self.fc2 = nn.Linear(16, output_dim)
        self.relu = nn.ReLU()

    def forward(self, seq_x, static_x):
        # seq_x shape: (batch, seq_len, seq_in_dim)
        # static_x shape: (batch, static_in_dim)
        lstm_out, _ = self.lstm(seq_x)
        last_hidden = lstm_out[:, -1, :]  # (batch, hidden_dim)
        combined = torch.cat([last_hidden, static_x], dim=1)  # (batch, hidden_dim + static_in_dim)
        out = self.relu(self.fc1(combined))
        logits = self.fc2(out)
        return logits


def generate_synthetic_data(num_samples=2000, seq_len=3):
    rng = np.random.default_rng(42)
    seq_data = []
    static_data = []
    labels = []

    phases = ["menstrual", "follicular", "ovulatory", "luteal"]

    for _ in range(num_samples):
        # Generate user baseline cycle length
        base_len = rng.normal(29, 2.5)
        base_len = max(22, min(base_len, 40))

        # Sequence of past cycle lengths and flow intensities
        seq = []
        for _ in range(seq_len):
            c_len = rng.normal(base_len, 1.2)
            flow = rng.uniform(2, 5)
            seq.append([c_len, flow])
        seq_data.append(seq)

        # Current cycle status
        current_len = rng.normal(base_len, 1.2)
        day_in_cycle = rng.uniform(1, current_len)
        static_data.append([current_len, day_in_cycle])

        # Phase label logic (proportional mapping)
        m_end = max(1, round(5 * current_len / 28))
        f_end = max(m_end + 1, round(13 * current_len / 28))
        o_end = max(f_end + 1, round(16 * current_len / 28))

        if day_in_cycle <= m_end:
            phase_idx = 0
        elif day_in_cycle <= f_end:
            phase_idx = 1
        elif day_in_cycle <= o_end:
            phase_idx = 2
        else:
            phase_idx = 3

        labels.append(phase_idx)

    return (
        torch.tensor(seq_data, dtype=torch.float32),
        torch.tensor(static_data, dtype=torch.float32),
        torch.tensor(labels, dtype=torch.long),
    )


def main() -> None:
    print("Generating synthetic sequence data for LSTM...")
    seq_x, static_x, y = generate_synthetic_data()

    model = CycleLSTMClassifier()
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.01)

    # Simple training loop
    print("Training Cycle LSTM model...")
    epochs = 15
    batch_size = 64
    num_batches = len(seq_x) // batch_size

    for epoch in range(epochs):
        model.train()
        total_loss = 0.0
        for i in range(num_batches):
            start = i * batch_size
            end = start + batch_size

            optimizer.zero_grad()
            logits = model(seq_x[start:end], static_x[start:end])
            loss = criterion(logits, y[start:end])
            loss.backward()
            optimizer.step()
            total_loss += loss.item()

        if (epoch + 1) % 5 == 0 or epoch == 0:
            print(f"Epoch {epoch+1}/{epochs} | Loss: {total_loss/num_batches:.4f}")

    # Evaluate
    model.eval()
    with torch.no_grad():
        logits = model(seq_x, static_x)
        preds = torch.argmax(logits, dim=1)
        accuracy = (preds == y).float().mean().item()
        print(f"Final training accuracy: {accuracy:.4f}")

    out_dir = ROOT / "artifacts"
    out_dir.mkdir(parents=True, exist_ok=True)
    path = out_dir / "lstm_phase.pth"
    
    # Save both model weights and metadata
    torch.save(
        {
            "model_state_dict": model.state_dict(),
            "config": {
                "seq_in_dim": 2,
                "hidden_dim": 16,
                "static_in_dim": 2,
                "output_dim": 4,
            }
        },
        path
    )
    print(f"Saved LSTM model to {path}")


if __name__ == "__main__":
    main()
