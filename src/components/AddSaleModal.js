import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { addSale } from '../database/salesActions';

/**
 * AddSaleModal
 *
 * A form modal that writes a new Sale record to the local WatermelonDB
 * SQLite database. No network needed — this is fully offline-first.
 *
 * Props:
 *  visible  {boolean}  - controls modal visibility
 *  onClose  {Function} - called after save or cancel
 */
export default function AddSaleModal({ visible, onClose }) {
  const [productName, setProductName] = useState('');
  const [quantity,    setQuantity]    = useState('');
  const [price,       setPrice]       = useState('');
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState('');

  function reset() {
    setProductName('');
    setQuantity('');
    setPrice('');
    setError('');
    setSaving(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSave() {
    // ── Validation ─────────────────────────────────────────────────
    if (!productName.trim()) {
      setError('Product name is required.');
      return;
    }
    const qty = parseFloat(quantity);
    const prc = parseFloat(price);
    if (isNaN(qty) || qty <= 0) {
      setError('Quantity must be a positive number.');
      return;
    }
    if (isNaN(prc) || prc < 0) {
      setError('Price must be a valid number.');
      return;
    }

    // ── Write to WatermelonDB ───────────────────────────────────────
    try {
      setSaving(true);
      setError('');
      await addSale(productName, qty, prc);
      reset();
      onClose();
    } catch (e) {
      setError('Failed to save. Please try again.');
      setSaving(false);
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.sheet}>
          {/* ── Title ──────────────────────────────────────────────── */}
          <Text style={styles.title}>➕ Add Sale</Text>
          <Text style={styles.subtitle}>
            Saved locally in WatermelonDB (SQLite)
          </Text>

          {/* ── Fields ─────────────────────────────────────────────── */}
          <Text style={styles.label}>Product Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. iPhone 16 Pro"
            placeholderTextColor="#94a3b8"
            value={productName}
            onChangeText={setProductName}
            returnKeyType="next"
          />

          <Text style={styles.label}>Quantity</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 3"
            placeholderTextColor="#94a3b8"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="decimal-pad"
            returnKeyType="next"
          />

          <Text style={styles.label}>Price (per unit)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 999.00"
            placeholderTextColor="#94a3b8"
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
            returnKeyType="done"
          />

          {/* ── Error ──────────────────────────────────────────────── */}
          {Boolean(error) && <Text style={styles.errorText}>{error}</Text>}

          {/* ── Actions ────────────────────────────────────────────── */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={handleClose}
              disabled={saving}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>Save Sale</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: '#1e293b',
    backgroundColor: '#f8fafc',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    marginTop: 10,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 24,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748b',
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#6366f1',
    alignItems: 'center',
  },
  saveBtnDisabled: {
    backgroundColor: '#a5b4fc',
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
