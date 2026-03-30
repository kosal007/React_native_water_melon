import { useEffect, useState } from 'react';
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

/**
 * AddSaleModal
 *
 * Product add/edit form modal.
 *
 * Props:
 *  visible        {boolean}  - controls modal visibility
 *  onClose        {Function} - called after save or cancel
 *  onSubmit       {Function} - receives { name, price }
 *  initialProduct {Object?}  - existing product for edit
 *  submitting     {boolean}  - parent processing state
 */
export default function AddSaleModal({
  visible,
  onClose,
  onSubmit,
  initialProduct = null,
  submitting = false,
}) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');

  const isEditing = Boolean(initialProduct);

  useEffect(() => {
    if (!visible) return;

    setName(initialProduct?.name ? String(initialProduct.name) : '');
    setPrice(
      typeof initialProduct?.price === 'number'
        ? String(initialProduct.price)
        : '',
    );
    setError('');
  }, [visible, initialProduct]);

  function reset() {
    setName('');
    setPrice('');
    setError('');
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSave() {
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }

    const prc = parseFloat(price);
    if (isNaN(prc) || prc < 0) {
      setError('Price must be a valid number.');
      return;
    }

    try {
      setError('');
      await onSubmit({
        name: name.trim(),
        price: prc,
      });
      reset();
      onClose();
    } catch (e) {
      setError('Failed to save product. Please try again.');
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
          <Text style={styles.title}>{isEditing ? '✏️ Edit Product' : '➕ Add Product'}</Text>
          <Text style={styles.subtitle}>
            Offline-first: save local now, sync when online.
          </Text>

          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. iPhone 16 Pro"
            placeholderTextColor="#94a3b8"
            value={name}
            onChangeText={setName}
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

          {Boolean(error) && <Text style={styles.errorText}>{error}</Text>}

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={handleClose}
              disabled={submitting}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveBtn, submitting && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>
                  {isEditing ? 'Update Product' : 'Save Product'}
                </Text>
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
