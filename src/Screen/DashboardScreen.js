import { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AddSaleModal from '../components/AddSaleModal';
import NetworkBanner from '../components/NetworkBanner';
import {
  createLocalProduct,
  deleteLocalProduct,
  updateLocalProduct,
} from '../database/productActions';
import { useNetworkStatus } from '../hook/useNetworkStatus.ts';
import { useProducts } from '../hook/useProducts';
import { useProductSync } from '../hook/useProductSync.ts';

function SyncStatusCard({
  isOnline,
  syncing,
  lastSyncAt,
  syncError,
  onPushNow,
  onPullNow,
}) {
  const title = syncing
    ? 'Syncing with backend...'
    : isOnline
    ? 'Connected to backend'
    : 'Offline mode active';

  const description = syncing
    ? 'Pulling and pushing product changes.'
    : isOnline
    ? 'Manual sync mode: tap Push or Pull when you want to sync.'
    : 'Create, update, and delete work locally. Sync when you are online and tap a button.';

  return (
    <View style={[styles.card, { borderLeftColor: isOnline ? '#22c55e' : '#ef4444' }]}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardIcon}>{syncing ? '⏳' : isOnline ? '✅' : '📴'}</Text>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <Text style={styles.cardBody}>{description}</Text>

      <Text style={styles.metaText}>
        Last sync: {lastSyncAt ? new Date(lastSyncAt).toLocaleString() : 'Never'}
      </Text>

      {syncError ? (
        <Text style={styles.errorText} numberOfLines={2}>
          Sync error: {String(syncError?.message || syncError)}
        </Text>
      ) : null}

      <View style={styles.syncActionsRow}>
        <TouchableOpacity
          style={[styles.syncNowBtn, (!isOnline || syncing) && styles.syncNowBtnDisabled]}
          onPress={onPushNow}
          disabled={!isOnline || syncing}
        >
          {syncing ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.syncNowBtnText}>Push</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.syncNowBtn, (!isOnline || syncing) && styles.syncNowBtnDisabled]}
          onPress={onPullNow}
          disabled={!isOnline || syncing}
        >
          {syncing ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.syncNowBtnText}>Pull</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ProductRow({ product, onEdit, onDelete }) {
  return (
    <View style={styles.saleRow}>
      <View style={styles.saleInfo}>
        <Text style={styles.saleProduct}>{product.name}</Text>
        <Text style={styles.saleMeta}>${Number(product.price || 0).toFixed(2)}</Text>
      </View>

      <View style={styles.rowActions}>
        <TouchableOpacity style={styles.editBtn} onPress={onEdit}>
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
          <Text style={styles.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── DashboardScreen ───────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const { isOnline } = useNetworkStatus();
  const { products, loading } = useProducts();
  const { syncing, lastSyncAt, syncError, syncNow } = useProductSync(isOnline);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSaveProduct(values) {
    setSubmitting(true);
    try {
      if (editingProduct) {
        await updateLocalProduct(editingProduct, values);
      } else {
        await createLocalProduct(values);
      }
    } catch (error) {
      console.error('Failed to save product:', error);
      throw error;
    } finally {
      setSubmitting(false);
    }
  }

  function handleOpenAdd() {
    setEditingProduct(null);
    setModalVisible(true);
  }

  function handleOpenEdit(product) {
    setEditingProduct(product);
    setModalVisible(true);
  }

  async function handleDelete(product) {
    try {
      await deleteLocalProduct(product);
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ───────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Products</Text>
            <Text style={styles.headerSub}>Offline-first + Backend sync</Text>
          </View>
          <View
            style={[
              styles.liveDot,
              { backgroundColor: isOnline ? '#22c55e' : '#ef4444' },
            ]}
          />
        </View>

        {/* ── Network Banner (reusable component) ──────────────────── */}
        <NetworkBanner />

        <SyncStatusCard
          isOnline={isOnline}
          syncing={syncing}
          lastSyncAt={lastSyncAt}
          syncError={syncError}
          onPushNow={syncNow}
          onPullNow={syncNow}
        />

        {/* ── Products (WatermelonDB) ───────────────────────────────── */}
        <View style={styles.salesHeader}>
          <Text style={styles.sectionLabel}>Product List (WatermelonDB)</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={handleOpenAdd}
          >
            <Text style={styles.addBtnText}>+ Add Product</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator
            style={{ marginTop: 20 }}
            color="#6366f1"
            size="large"
          />
        ) : products.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>No products yet.</Text>
            <Text style={styles.emptyHint}>
              Tap "+ Add Product" to save locally.
            </Text>
          </View>
        ) : (
          <View style={styles.salesList}>
            {products.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                onEdit={() => handleOpenEdit(product)}
                onDelete={() => handleDelete(product)}
              />
            ))}
            <Text style={styles.salesCount}>
              {products.length} product{products.length !== 1 ? 's' : ''} in local database
            </Text>
          </View>
        )}
      </ScrollView>

      {/* ── Add Sale Modal ───────────────────────────────────────────── */}
      <AddSaleModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingProduct(null);
        }}
        onSubmit={handleSaveProduct}
        initialProduct={editingProduct}
        submitting={submitting}
      />
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scroll: {
    paddingBottom: 40,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 6,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  liveDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },

  // Shared card
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardIcon: {
    fontSize: 18,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  cardBody: {
    marginTop: 6,
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
  },
  metaText: {
    marginTop: 10,
    fontSize: 12,
    color: '#64748b',
  },
  errorText: {
    marginTop: 6,
    fontSize: 12,
    color: '#dc2626',
  },
  syncNowBtn: {
    marginTop: 12,
    backgroundColor: '#6366f1',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 96,
    alignItems: 'center',
  },
  syncActionsRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  syncNowBtnDisabled: {
    backgroundColor: '#a5b4fc',
  },
  syncNowBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 2,
  },

  // Sales section
  salesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 16,
    marginTop: 8,
  },
  addBtn: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  salesList: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  salesCount: {
    textAlign: 'center',
    fontSize: 11,
    color: '#94a3b8',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  saleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  saleInfo: {
    flex: 1,
    marginRight: 10,
  },
  saleProduct: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
  },
  saleMeta: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  saleTotal: {
    fontWeight: '700',
    color: '#0f172a',
  },
  saleRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editBtn: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editBtnText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '700',
  },
  deleteBtn: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  deleteBtnText: {
    color: '#b91c1c',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 14,
    marginTop: 8,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
  },
  emptyHint: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 24,
  },

});
