/**
 * Chart of Accounts Component
 * مكون شجرة الحسابات المحاسبية
 */

import { Component, OnInit, inject, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { TranslateModule } from '@ngx-translate/core';
import { TablerIconComponent } from 'angular-tabler-icons';
import { 
  NestedTreeControl 
} from '@angular/cdk/tree';
import { 
  MatTreeNestedDataSource 
} from '@angular/material/tree';
import { 
  ChartOfAccountsService 
} from 'src/app/services/chart-of-accounts.service';
import {
  Account, 
  AccountType,
  AccountNature,
  AccountStatus
} from 'src/app/models/chart-of-accounts.model';
import { CoreService } from 'src/app/services/core.service';
import { MatDialog } from '@angular/material/dialog';
import { ZeroPaddingDialogComponent, ZeroPaddingDialogData, ZeroPaddingPreviewRow } from './zero-padding-dialog/zero-padding-dialog.component';
import { AddAccountDialogComponent, AddAccountDialogData } from './add-account-dialog/add-account-dialog.component';
import { AddCodeDialogComponent, AddCodeDialogData } from './add-code-dialog/add-code-dialog.component';
import { DeleteAccountDialogComponent, DeleteAccountDialogData } from './delete-account-dialog/delete-account-dialog.component';

/**
 * Tree Node Interface
 */
interface AccountTreeNode {
  account: Account;
  children?: AccountTreeNode[];
  expandable: boolean;
  level: number;
}

/**
 * Flat Tree Node Interface
 */
interface AccountFlatNode {
  account: Account;
  expandable: boolean;
  level: number;
}

/**
 * Flat item for section rendering
 */
interface FlatItem {
  account: Account;
  depth: number;
  hasChildren: boolean;
}

@Component({
  selector: 'app-chart-of-accounts',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    TranslateModule,
    TablerIconComponent,
  ],
  templateUrl: './chart-of-accounts.component.html',
  styleUrl: './chart-of-accounts.component.scss',
})
export class ChartOfAccountsComponent implements OnInit {
  private chartService = inject(ChartOfAccountsService);
  private coreService = inject(CoreService);
  private dialog = inject(MatDialog);

  // Tree Control
  treeControl = new NestedTreeControl<AccountTreeNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<AccountTreeNode>();

  // Search
  searchQuery = signal('');
  filteredAccounts = signal<Account[]>([]);

  // UI State
  isLoading = signal(false);
  showSearch = signal(false);

  // Options
  options = signal(this.coreService.getOptions());
  dir = computed(() => this.options().dir);

  // Account Type Colors
  accountTypeColors = {
    [AccountType.ASSET]:     { bg: '#e8f5e9', text: '#2e7d32', border: '#4caf50' },
    [AccountType.LIABILITY]: { bg: '#fff3e0', text: '#e65100', border: '#ff9800' },
    [AccountType.EQUITY]:    { bg: '#e3f2fd', text: '#1565c0', border: '#2196f3' },
    [AccountType.REVENUE]:   { bg: '#f3e5f5', text: '#7b1fa2', border: '#9c27b0' },
    [AccountType.EXPENSE]:   { bg: '#fce4ec', text: '#c2185b', border: '#e91e63' }
  };

  // ── Ledger Board View ────────────────────────────────────────────
  // Signal mirror of dataSource.data so computed() can react to data loads
  boardData = signal<AccountTreeNode[]>([]);

  // ── Account Structure Builder ─────────────────────────────────────
  // Which category sections are open
  openSections = signal(new Set<string>());

  // Which sub-tree nodes are expanded within sections
  nodeExpandedSet = signal(new Set<string>());

  // IDs of accounts whose codes were just zero-padded (for flash animation)
  updatedCodeIds = signal(new Set<string>());

  // Flat category data with visible items
  categories = computed(() => {
    const expandedNodes = this.nodeExpandedSet();
    return this.boardData().map(rootNode => ({
      type:        rootNode.account.type,
      typeId:      rootNode.account.id,
      label:       this.getTypeNameWithoutNumber(rootNode.account),
      totalCount:  this.flattenAll(rootNode.children ?? []).length,
      visibleItems: this.flattenVisible(rootNode.children ?? [], 1, expandedNodes),
      rootNode,
    }));
  });

  // Header stats pills
  tableStats = computed(() => {
    const all = this.chartService.getAllAccounts();
    return {
      total:   all.length,
      active:  all.filter(a => a.isActive).length,
      parents: all.filter(a =>  a.isParent).length,
      leaves:  all.filter(a => !a.isParent).length,
    };
  });

  constructor() {
    // Listen to theme changes
    this.coreService.notify.subscribe(() => {
      this.options.set(this.coreService.getOptions());
    });
  }

  ngOnInit(): void {
    this.loadChartOfAccounts();
  }

  /**
   * Load Chart of Accounts
   */
  loadChartOfAccounts(): void {
    this.isLoading.set(true);
    
    try {
      const accounts = this.chartService.getAllAccounts();
      const treeData = this.buildTree(accounts);
      this.dataSource.data = treeData;
      this.boardData.set([...treeData]);
      this.openSections.set(new Set(treeData.map(n => n.account.id)));
    } catch (error) {
      console.error('Error loading chart of accounts:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Build Tree Structure by Account Type
   */
  private buildTree(accounts: Account[]): AccountTreeNode[] {
    // Group accounts by type
    const accountsByType = new Map<AccountType, Account[]>();
    accounts.forEach(account => {
      if (!accountsByType.has(account.type)) {
        accountsByType.set(account.type, []);
      }
      accountsByType.get(account.type)!.push(account);
    });

    // Create root nodes for each account type
    const rootNodes: AccountTreeNode[] = [];
    
    // Define type order and labels
    const typeOrder: { type: AccountType; label: string; labelEn: string; number: number }[] = [
      { type: AccountType.ASSET, label: 'الأصول', labelEn: 'Assets', number: 1 },
      { type: AccountType.LIABILITY, label: 'الخصوم', labelEn: 'Liabilities', number: 2 },
      { type: AccountType.EQUITY, label: 'حقوق الملكية', labelEn: 'Equity', number: 3 },
      { type: AccountType.EXPENSE, label: 'الاستخدامات', labelEn: 'Expenses', number: 4 },
      { type: AccountType.REVENUE, label: 'الموارد', labelEn: 'Revenue', number: 5 }
    ];

    typeOrder.forEach(({ type, label, labelEn, number }, index) => {
      const typeAccounts = accountsByType.get(type) || [];
      if (typeAccounts.length > 0) {
        // Create a virtual parent node for this account type
        const virtualParent: Account = {
          id: `type-${type}`,
          code: `${number}`,
          name: `${number}. ${label}`,
          nameEn: `${number}. ${labelEn}`,
          type: type,
          nature: type === AccountType.ASSET || type === AccountType.EXPENSE ? AccountNature.DEBIT : AccountNature.CREDIT,
          level: 1,
          isParent: true,
          isActive: true,
          status: AccountStatus.ACTIVE,
          balance: 0,
          openingBalance: 0,
          currency: 'SAR',
          isSystemAccount: true,
          allowManualEntry: false,
          displayOrder: index + 1
        };

        // Build tree for accounts of this type
        const accountMap = new Map<string, AccountTreeNode>();
        const typeNodes: AccountTreeNode[] = [];

        // Create nodes
        typeAccounts.forEach(account => {
          const node: AccountTreeNode = {
            account,
            children: [],
            expandable: account.isParent,
            level: account.level
          };
          accountMap.set(account.id, node);
        });

        // Build tree structure
        typeAccounts.forEach(account => {
          const node = accountMap.get(account.id)!;
          if (account.parentId) {
            const parent = accountMap.get(account.parentId);
            if (parent) {
              parent.children!.push(node);
            } else {
              // If parent not found in same type, add as root
              typeNodes.push(node);
            }
          } else {
            // Accounts without parentId are root level accounts (direct children of type root)
            typeNodes.push(node);
          }
        });

        // Special handling for ASSET type: Replace old accounts with new ones
        if (type === AccountType.ASSET) {
          // Remove old accounts (1100, 1200, etc.) and keep only the new structure
          // Filter out old accounts that don't start with '100000'
          typeNodes.length = 0; // Clear existing nodes
          accountMap.clear(); // Clear the map
          // Add الأصول الثابتة
          const fixedAssetsAccount: Account = {
            id: '100000001',
            code: '100000001',
            name: 'الأصول الثابتة',
            nameEn: 'Fixed Assets',
            type: AccountType.ASSET,
            nature: AccountNature.DEBIT,
            level: 1,
            isParent: true,
            isActive: true,
            status: AccountStatus.ACTIVE,
            balance: 0,
            openingBalance: 0,
            currency: 'SAR',
            isSystemAccount: true,
            allowManualEntry: false,
            displayOrder: 1
          };

          // Add الأصول المتداولة
          const currentAssetsAccount: Account = {
            id: '100000002',
            code: '100000002',
            name: 'الأصول المتداولة',
            nameEn: 'Current Assets',
            type: AccountType.ASSET,
            nature: AccountNature.DEBIT,
            level: 1,
            isParent: true,
            isActive: true,
            status: AccountStatus.ACTIVE,
            balance: 0,
            openingBalance: 0,
            currency: 'SAR',
            isSystemAccount: true,
            allowManualEntry: false,
            displayOrder: 2
          };

          // Add حسابات مدينه اخرى
          const otherReceivablesAccount: Account = {
            id: '100000003',
            code: '100000003',
            name: 'حسابات مدينه اخرى',
            nameEn: 'Other Receivables',
            type: AccountType.ASSET,
            nature: AccountNature.DEBIT,
            level: 1,
            isParent: true,
            isActive: true,
            status: AccountStatus.ACTIVE,
            balance: 0,
            openingBalance: 0,
            currency: 'SAR',
            isSystemAccount: true,
            allowManualEntry: false,
            displayOrder: 3
          };

          // Create child accounts for Fixed Assets (100000001)
          const fixedAssetsChildren: Account[] = [
            {
              id: '1000000010001',
              code: '1000000010001',
              parentId: '100000001',
              name: 'أراضي',
              nameEn: 'Land',
              type: AccountType.ASSET,
              nature: AccountNature.DEBIT,
              level: 2,
              isParent: true,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 1
            },
            {
              id: '1000000010002',
              code: '1000000010002',
              parentId: '100000001',
              name: 'مباني',
              nameEn: 'Buildings',
              type: AccountType.ASSET,
              nature: AccountNature.DEBIT,
              level: 2,
              isParent: true,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 2
            },
            {
              id: '1000000010003',
              code: '1000000010003',
              parentId: '100000001',
              name: 'الآلات والمعدات',
              nameEn: 'Machinery and Equipment',
              type: AccountType.ASSET,
              nature: AccountNature.DEBIT,
              level: 2,
              isParent: true,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 3
            },
            {
              id: '1000000010004',
              code: '1000000010004',
              parentId: '100000001',
              name: 'السيارات',
              nameEn: 'Vehicles',
              type: AccountType.ASSET,
              nature: AccountNature.DEBIT,
              level: 2,
              isParent: true,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 4
            },
            {
              id: '1000000010005',
              code: '1000000010005',
              parentId: '100000001',
              name: 'اجهزة كمبيوتر وطابعات',
              nameEn: 'Computers and Printers',
              type: AccountType.ASSET,
              nature: AccountNature.DEBIT,
              level: 2,
              isParent: true,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 5
            },
            {
              id: '1000000010006',
              code: '1000000010006',
              parentId: '100000001',
              name: 'هناجر وتركيبات',
              nameEn: 'Warehouses and Installations',
              type: AccountType.ASSET,
              nature: AccountNature.DEBIT,
              level: 2,
              isParent: true,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 6
            },
            {
              id: '1000000010007',
              code: '1000000010007',
              parentId: '100000001',
              name: 'اثاث ومفروشات مكتبية',
              nameEn: 'Office Furniture and Furnishings',
              type: AccountType.ASSET,
              nature: AccountNature.DEBIT,
              level: 2,
              isParent: true,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 7
            }
          ];

          // Create child accounts for Land (1000000010001)
          const landChildren: Account[] = [
            {
              id: '100000001000101',
              code: '100000001000101',
              parentId: '1000000010001',
              name: 'ارضية بيضاء مكة الزاهر',
              nameEn: 'White Land Mecca Al-Zahir',
              type: AccountType.ASSET,
              nature: AccountNature.DEBIT,
              level: 3,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 1
            },
            {
              id: '100000001000102',
              code: '100000001000102',
              parentId: '1000000010001',
              name: 'ارضية شارع المحجر',
              nameEn: 'Land Al-Mahjar Street',
              type: AccountType.ASSET,
              nature: AccountNature.DEBIT,
              level: 3,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 2
            },
            {
              id: '100000001000103',
              code: '100000001000103',
              parentId: '1000000010001',
              name: 'Test',
              nameEn: 'Test',
              type: AccountType.ASSET,
              nature: AccountNature.DEBIT,
              level: 3,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 3
            },
            {
              id: '100000001000104',
              code: '100000001000104',
              parentId: '1000000010001',
              name: 'أرض الخمرة',
              nameEn: 'Al-Khumra Land',
              type: AccountType.ASSET,
              nature: AccountNature.DEBIT,
              level: 3,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 4
            }
          ];

          // Create child accounts for Buildings (1000000010002)
          const buildingsChildren: Account[] = [
            {
              id: '10000000100021',
              code: '10000000100021',
              parentId: '1000000010002',
              name: 'عقار عمارة شارع السبعين',
              nameEn: 'Building Property 70th Street',
              type: AccountType.ASSET,
              nature: AccountNature.DEBIT,
              level: 3,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 1
            },
            {
              id: '10000000100022',
              code: '10000000100022',
              parentId: '1000000010002',
              name: 'عمارة شارع الملك عبدالعزيز',
              nameEn: 'Building King Abdulaziz Street',
              type: AccountType.ASSET,
              nature: AccountNature.DEBIT,
              level: 3,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 2
            },
            {
              id: '10000000100023',
              code: '10000000100023',
              parentId: '1000000010002',
              name: 'عمارة ملك سلمان',
              nameEn: 'Building King Salman',
              type: AccountType.ASSET,
              nature: AccountNature.DEBIT,
              level: 3,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 3
            }
          ];

          // Create child accounts for Machinery and Equipment (1000000010003)
          const machineryChildren: Account[] = [
            {
              id: '1000000010003001',
              code: '1000000010003001',
              parentId: '1000000010003',
              name: 'الة فك وشد',
              nameEn: 'Tightening and Loosening Machine',
              type: AccountType.ASSET,
              nature: AccountNature.DEBIT,
              level: 3,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 1
            },
            {
              id: '1000000010003002',
              code: '1000000010003002',
              parentId: '1000000010003',
              name: 'الة سحب وطرق',
              nameEn: 'Pulling and Hammering Machine',
              type: AccountType.ASSET,
              nature: AccountNature.DEBIT,
              level: 3,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 2
            },
            {
              id: '1000000010003003',
              code: '1000000010003003',
              parentId: '1000000010003',
              name: 'مكينة فرن الصهر',
              nameEn: 'Smelting Furnace Machine',
              type: AccountType.ASSET,
              nature: AccountNature.DEBIT,
              level: 3,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 3
            }
          ];

          // Create child accounts for Vehicles (1000000010004)
          const vehiclesChildren: Account[] = [
            {
              id: '100000001000401',
              code: '100000001000401',
              parentId: '1000000010004',
              name: 'سيارة بي ام دبليو',
              nameEn: 'BMW Car',
              type: AccountType.ASSET,
              nature: AccountNature.DEBIT,
              level: 3,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 1
            },
            {
              id: '100000001000402',
              code: '100000001000402',
              parentId: '1000000010004',
              name: 'مستبيشي',
              nameEn: 'Mercedes-Benz',
              type: AccountType.ASSET,
              nature: AccountNature.DEBIT,
              level: 3,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 2
            },
            {
              id: '100000001000403',
              code: '100000001000403',
              parentId: '1000000010004',
              name: 'سيارة يارس',
              nameEn: 'Yaris Car',
              type: AccountType.ASSET,
              nature: AccountNature.DEBIT,
              level: 3,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 3
            }
          ];

          // Create child accounts for Computers and Printers (1000000010005)
          const computersChildren: Account[] = [
            {
              id: '10000000100051',
              code: '10000000100051',
              parentId: '1000000010005',
              name: 'اجهزة حاسب الي',
              nameEn: 'Computer Devices',
              type: AccountType.ASSET,
              nature: AccountNature.DEBIT,
              level: 3,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 1
            },
            {
              id: '10000000100052',
              code: '10000000100052',
              parentId: '1000000010005',
              name: 'طابعات واجهزة مكتبية',
              nameEn: 'Printers and Office Equipment',
              type: AccountType.ASSET,
              nature: AccountNature.DEBIT,
              level: 3,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 2
            }
          ];

          // Create child accounts for Warehouses and Installations (1000000010006)
          const warehousesChildren: Account[] = [
            {
              id: '10000000100061',
              code: '10000000100061',
              parentId: '1000000010006',
              name: 'هنجر قسم الوارد ـ حسان',
              nameEn: 'Incoming Warehouse - Hassan',
              type: AccountType.ASSET,
              nature: AccountNature.DEBIT,
              level: 3,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 1
            },
            {
              id: '10000000100062',
              code: '10000000100062',
              parentId: '1000000010006',
              name: 'هنجر قسم المطبخ ـ محمد حسن',
              nameEn: 'Kitchen Warehouse - Mohammed Hassan',
              type: AccountType.ASSET,
              nature: AccountNature.DEBIT,
              level: 3,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 2
            }
          ];

          // Create child accounts for Office Furniture and Furnishings (1000000010007)
          const furnitureChildren: Account[] = [
            {
              id: '10000000100071',
              code: '10000000100071',
              parentId: '1000000010007',
              name: 'اثاث ومفروشات مكتب المدير العام',
              nameEn: 'General Manager Office Furniture',
              type: AccountType.ASSET,
              nature: AccountNature.DEBIT,
              level: 3,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 1
            },
            {
              id: '10000000100072',
              code: '10000000100072',
              parentId: '1000000010007',
              name: 'اثاث ومفروشات مكتب نائب المدير العام',
              nameEn: 'Deputy General Manager Office Furniture',
              type: AccountType.ASSET,
              nature: AccountNature.DEBIT,
              level: 3,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 2
            }
          ];

          // Create child nodes for Land
          const landChildNodes: AccountTreeNode[] = landChildren.map(acc => ({
            account: acc,
            children: [],
            expandable: false,
            level: 3
          }));

          // Create child nodes for Buildings
          const buildingsChildNodes: AccountTreeNode[] = buildingsChildren.map(acc => ({
            account: acc,
            children: [],
            expandable: false,
            level: 3
          }));

          // Create child nodes for Machinery and Equipment
          const machineryChildNodes: AccountTreeNode[] = machineryChildren.map(acc => ({
            account: acc,
            children: [],
            expandable: false,
            level: 3
          }));

          // Create child nodes for Vehicles
          const vehiclesChildNodes: AccountTreeNode[] = vehiclesChildren.map(acc => ({
            account: acc,
            children: [],
            expandable: false,
            level: 3
          }));

          // Create child nodes for Computers and Printers
          const computersChildNodes: AccountTreeNode[] = computersChildren.map(acc => ({
            account: acc,
            children: [],
            expandable: false,
            level: 3
          }));

          // Create child nodes for Warehouses and Installations
          const warehousesChildNodes: AccountTreeNode[] = warehousesChildren.map(acc => ({
            account: acc,
            children: [],
            expandable: false,
            level: 3
          }));

          // Create child nodes for Office Furniture and Furnishings
          const furnitureChildNodes: AccountTreeNode[] = furnitureChildren.map(acc => ({
            account: acc,
            children: [],
            expandable: false,
            level: 3
          }));

          // Create child accounts for Current Assets (100000002)
          const currentAssetsChildren: Account[] = [
            {
              id: '10000000201',
              code: '10000000201',
              parentId: '100000002',
              name: 'المخزون',
              nameEn: 'Inventory',
              type: AccountType.ASSET,
              nature: AccountNature.DEBIT,
              level: 2,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 1
            },
            {
              id: '10000000202',
              code: '10000000202',
              parentId: '100000002',
              name: 'العملاء',
              nameEn: 'Customers',
              type: AccountType.ASSET,
              nature: AccountNature.DEBIT,
              level: 2,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 2
            },
            {
              id: '10000000203',
              code: '10000000203',
              parentId: '100000002',
              name: 'النقدية',
              nameEn: 'Cash',
              type: AccountType.ASSET,
              nature: AccountNature.DEBIT,
              level: 2,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 3
            },
            {
              id: '10000000204',
              code: '10000000204',
              parentId: '100000002',
              name: 'ضريبة القيمة المضافة على المدخلات',
              nameEn: 'VAT on Inputs',
              type: AccountType.ASSET,
              nature: AccountNature.DEBIT,
              level: 2,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 4
            },
            {
              id: '10000000205',
              code: '10000000205',
              parentId: '100000002',
              name: 'النقدية',
              nameEn: 'Cash',
              type: AccountType.ASSET,
              nature: AccountNature.DEBIT,
              level: 2,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 5
            }
          ];

          // Create child accounts for Other Receivables (100000003)
          const otherReceivablesChildren: Account[] = [
            {
              id: '1000000031',
              code: '1000000031',
              parentId: '100000003',
              name: 'سلف موظفين',
              nameEn: 'Employee Advances',
              type: AccountType.ASSET,
              nature: AccountNature.DEBIT,
              level: 2,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 1
            },
            {
              id: '1000000032',
              code: '1000000032',
              parentId: '100000003',
              name: 'عهد مستديمة لدى الموظفين',
              nameEn: 'Permanent Custody with Employees',
              type: AccountType.ASSET,
              nature: AccountNature.DEBIT,
              level: 2,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 2
            },
            {
              id: '1000000033',
              code: '1000000033',
              parentId: '100000003',
              name: 'عهد مؤقتة لدى الموظفين',
              nameEn: 'Temporary Custody with Employees',
              type: AccountType.ASSET,
              nature: AccountNature.DEBIT,
              level: 2,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 3
            },
            {
              id: '1000000034',
              code: '1000000034',
              parentId: '100000003',
              name: 'ذمم الموظفين',
              nameEn: 'Employee Accounts Receivable',
              type: AccountType.ASSET,
              nature: AccountNature.DEBIT,
              level: 2,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 4
            },
            {
              id: '1000000035',
              code: '1000000035',
              parentId: '100000003',
              name: 'حسابات وسيطة',
              nameEn: 'Intermediate Accounts',
              type: AccountType.ASSET,
              nature: AccountNature.DEBIT,
              level: 2,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 5
            },
            {
              id: '1000000036',
              code: '1000000036',
              parentId: '100000003',
              name: 'مصوفات مدوفوعة مقدما',
              nameEn: 'Prepaid Expenses',
              type: AccountType.ASSET,
              nature: AccountNature.DEBIT,
              level: 2,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 6
            },
            {
              id: '1000000037',
              code: '1000000037',
              parentId: '100000003',
              name: 'حساب الموظف احمد',
              nameEn: 'Employee Ahmed Account',
              type: AccountType.ASSET,
              nature: AccountNature.DEBIT,
              level: 2,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 7
            },
            {
              id: '1000000038',
              code: '1000000038',
              parentId: '100000003',
              name: 'حساب العهد',
              nameEn: 'Custody Account',
              type: AccountType.ASSET,
              nature: AccountNature.DEBIT,
              level: 2,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 8
            }
          ];

          // Create child nodes for Current Assets
          const currentAssetsChildNodes: AccountTreeNode[] = currentAssetsChildren.map(acc => ({
            account: acc,
            children: [],
            expandable: false,
            level: 2
          }));

          // Create child nodes for Other Receivables
          const otherReceivablesChildNodes: AccountTreeNode[] = otherReceivablesChildren.map(acc => ({
            account: acc,
            children: [],
            expandable: false,
            level: 2
          }));

          // Create child nodes for Fixed Assets
          const fixedAssetsChildNodes: AccountTreeNode[] = fixedAssetsChildren.map(acc => {
            const node: AccountTreeNode = {
              account: acc,
              children: [],
              expandable: acc.isParent,
              level: 2
            };

            // Add children for each account
            if (acc.id === '1000000010001') {
              node.children = landChildNodes;
              node.expandable = true;
            } else if (acc.id === '1000000010002') {
              node.children = buildingsChildNodes;
              node.expandable = true;
            } else if (acc.id === '1000000010003') {
              node.children = machineryChildNodes;
              node.expandable = true;
            } else if (acc.id === '1000000010004') {
              node.children = vehiclesChildNodes;
              node.expandable = true;
            } else if (acc.id === '1000000010005') {
              node.children = computersChildNodes;
              node.expandable = true;
            } else if (acc.id === '1000000010006') {
              node.children = warehousesChildNodes;
              node.expandable = true;
            } else if (acc.id === '1000000010007') {
              node.children = furnitureChildNodes;
              node.expandable = true;
            }

            return node;
          });

          // Create nodes for fixed accounts
          const fixedAssetsNode: AccountTreeNode = {
            account: fixedAssetsAccount,
            children: fixedAssetsChildNodes,
            expandable: true,
            level: 1
          };

          const currentAssetsNode: AccountTreeNode = {
            account: currentAssetsAccount,
            children: currentAssetsChildNodes,
            expandable: true,
            level: 1
          };

          const otherReceivablesNode: AccountTreeNode = {
            account: otherReceivablesAccount,
            children: otherReceivablesChildNodes,
            expandable: true,
            level: 1
          };

          // Replace all nodes with only the new structure
          typeNodes.push(fixedAssetsNode);      // displayOrder: 1
          typeNodes.push(currentAssetsNode);    // displayOrder: 2
          typeNodes.push(otherReceivablesNode); // displayOrder: 3
        }

        // Special handling for LIABILITY type
        if (type === AccountType.LIABILITY) {
          // Clear existing nodes and build new structure
          typeNodes.length = 0;
          accountMap.clear();

          // Create الخصوم الثابتة (201)
          const fixedLiabilitiesAccount: Account = {
            id: '201',
            code: '201',
            name: 'الخصوم الثابتة',
            nameEn: 'Fixed Liabilities',
            type: AccountType.LIABILITY,
            nature: AccountNature.CREDIT,
            level: 1,
            isParent: true,
            isActive: true,
            status: AccountStatus.ACTIVE,
            balance: 0,
            openingBalance: 0,
            currency: 'SAR',
            isSystemAccount: true,
            allowManualEntry: false,
            displayOrder: 1
          };

          // Create الخصوم المتداولة (202)
          const currentLiabilitiesAccount: Account = {
            id: '202',
            code: '202',
            name: 'الخصوم المتداولة',
            nameEn: 'Current Liabilities',
            type: AccountType.LIABILITY,
            nature: AccountNature.CREDIT,
            level: 1,
            isParent: true,
            isActive: true,
            status: AccountStatus.ACTIVE,
            balance: 0,
            openingBalance: 0,
            currency: 'SAR',
            isSystemAccount: true,
            allowManualEntry: false,
            displayOrder: 2
          };

          // Create حسابات دائنه اخرى (203)
          const otherPayablesAccount: Account = {
            id: '203',
            code: '203',
            name: 'حسابات دائنه اخرى',
            nameEn: 'Other Payables',
            type: AccountType.LIABILITY,
            nature: AccountNature.CREDIT,
            level: 1,
            isParent: true,
            isActive: true,
            status: AccountStatus.ACTIVE,
            balance: 0,
            openingBalance: 0,
            currency: 'SAR',
            isSystemAccount: true,
            allowManualEntry: false,
            displayOrder: 3
          };

          // Create شركه البوان (204)
          const albawanCompanyAccount: Account = {
            id: '204',
            code: '204',
            name: 'شركه البوان',
            nameEn: 'Al Bawan Company',
            type: AccountType.LIABILITY,
            nature: AccountNature.CREDIT,
            level: 1,
            isParent: false,
            isActive: true,
            status: AccountStatus.ACTIVE,
            balance: 0,
            openingBalance: 0,
            currency: 'SAR',
            isSystemAccount: true,
            allowManualEntry: false,
            displayOrder: 4
          };

          // Create child accounts for Fixed Liabilities (201)
          // 2011 - حقوق الملكية
          const equityAccount2011: Account = {
            id: '2011',
            code: '2011',
            parentId: '201',
            name: 'حقوق الملكية',
            nameEn: 'Equity',
            type: AccountType.LIABILITY,
            nature: AccountNature.CREDIT,
            level: 2,
            isParent: true,
            isActive: true,
            status: AccountStatus.ACTIVE,
            balance: 0,
            openingBalance: 0,
            currency: 'SAR',
            isSystemAccount: false,
            allowManualEntry: true,
            displayOrder: 1
          };

          // 20111 - رأس المال (with children)
          const capitalAccount20111: Account = {
            id: '20111',
            code: '20111',
            parentId: '2011',
            name: 'رأس المال',
            nameEn: 'Capital',
            type: AccountType.LIABILITY,
            nature: AccountNature.CREDIT,
            level: 3,
            isParent: true,
            isActive: true,
            status: AccountStatus.ACTIVE,
            balance: 0,
            openingBalance: 0,
            currency: 'SAR',
            isSystemAccount: false,
            allowManualEntry: true,
            displayOrder: 1
          };

          // Children of 20111 - رأس المال
          const capitalChildren: Account[] = [
            {
              id: '2011102',
              code: '2011102',
              parentId: '20111',
              name: 'حصة الشريك غسان',
              nameEn: 'Partner Ghassan Share',
              type: AccountType.LIABILITY,
              nature: AccountNature.CREDIT,
              level: 4,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 1
            },
            {
              id: '2011103',
              code: '2011103',
              parentId: '20111',
              name: 'حصة الشريك سالم',
              nameEn: 'Partner Salem Share',
              type: AccountType.LIABILITY,
              nature: AccountNature.CREDIT,
              level: 4,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 2
            }
          ];

          // Children of 2011 - حقوق الملكية
          const equity2011Children: Account[] = [
            capitalAccount20111,
            {
              id: '20112',
              code: '20112',
              parentId: '2011',
              name: 'جاري المالك',
              nameEn: 'Owner Current Account',
              type: AccountType.LIABILITY,
              nature: AccountNature.CREDIT,
              level: 3,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 2
            },
            {
              id: '20113',
              code: '20113',
              parentId: '2011',
              name: 'راس المال',
              nameEn: 'Capital',
              type: AccountType.LIABILITY,
              nature: AccountNature.CREDIT,
              level: 3,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 3
            }
          ];

          // Children of 201 - الخصوم الثابتة
          const fixedLiabilitiesChildren: Account[] = [
            equityAccount2011,
            {
              id: '2012',
              code: '2012',
              parentId: '201',
              name: 'حقوق الملكية',
              nameEn: 'Equity',
              type: AccountType.LIABILITY,
              nature: AccountNature.CREDIT,
              level: 2,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 2
            },
            {
              id: '2013',
              code: '2013',
              parentId: '201',
              name: 'جاري الشركاء',
              nameEn: 'Partners Current Account',
              type: AccountType.LIABILITY,
              nature: AccountNature.CREDIT,
              level: 2,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 3
            },
            {
              id: '2014',
              code: '2014',
              parentId: '201',
              name: 'المسحوبات',
              nameEn: 'Drawings',
              type: AccountType.LIABILITY,
              nature: AccountNature.CREDIT,
              level: 2,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 4
            }
          ];

          // Create nodes for Fixed Liabilities children
          const capitalChildNodes: AccountTreeNode[] = capitalChildren.map(acc => ({
            account: acc,
            children: [],
            expandable: false,
            level: 4
          }));

          const equity2011ChildNodes: AccountTreeNode[] = equity2011Children.map(acc => {
            const node: AccountTreeNode = {
              account: acc,
              children: [],
              expandable: acc.isParent,
              level: 3
            };
            if (acc.id === '20111') {
              node.children = capitalChildNodes;
              node.expandable = true;
            }
            return node;
          });

          const fixedLiabilitiesChildNodes: AccountTreeNode[] = fixedLiabilitiesChildren.map(acc => {
            const node: AccountTreeNode = {
              account: acc,
              children: [],
              expandable: acc.isParent,
              level: 2
            };
            if (acc.id === '2011') {
              node.children = equity2011ChildNodes;
              node.expandable = true;
            }
            return node;
          });

          const fixedLiabilitiesNode: AccountTreeNode = {
            account: fixedLiabilitiesAccount,
            children: fixedLiabilitiesChildNodes,
            expandable: true,
            level: 1
          };

          // Create Current Liabilities (202) structure
          // 2021 - الدائنون
          const creditorsAccount2021: Account = {
            id: '2021',
            code: '2021',
            parentId: '202',
            name: 'الدائنون',
            nameEn: 'Creditors',
            type: AccountType.LIABILITY,
            nature: AccountNature.CREDIT,
            level: 2,
            isParent: true,
            isActive: true,
            status: AccountStatus.ACTIVE,
            balance: 0,
            openingBalance: 0,
            currency: 'SAR',
            isSystemAccount: false,
            allowManualEntry: true,
            displayOrder: 1
          };

          // 202101 - الموردون (Suppliers - will have 135 children)
          const suppliersAccount202101: Account = {
            id: '202101',
            code: '202101',
            parentId: '2021',
            name: 'الموردون',
            nameEn: 'Suppliers',
            type: AccountType.LIABILITY,
            nature: AccountNature.CREDIT,
            level: 3,
            isParent: true,
            isActive: true,
            status: AccountStatus.ACTIVE,
            balance: 0,
            openingBalance: 0,
            currency: 'SAR',
            isSystemAccount: false,
            allowManualEntry: true,
            displayOrder: 1
          };

          // Generate supplier accounts (135 suppliers from 202101000002 to 202101000135)
          // Due to the large number, I'll create them programmatically
          const supplierAccounts: Account[] = [];
          const supplierNames = [
            'شركة الجفالي', 'شركة سواعد الاخاء', 'شركة منصور للتجارة والاستيراد', 'عبدالله حسن للاكسسوارات النسائية',
            'السيد للادوية الطبية', 'مورد خاص', 'مورد تجريبي', 'مورد 2022', 'مورد 2022', 'عبدالعزيز',
            'dsfggdff', 'احمد', 'عز الشريف', 'Ali Asali', 'مستودع جد', 'العالمية', 'مورد تجريبي', 'نوار',
            'بسام الضبيعي لادوات السباكة', 'مورد تجربة حساب مالي', 'مورد ناجح بن محسن', 'مورد مرة مرة مرة مرة جديد',
            'احمد', 'استبرق', 'مورد عميل مميز', 'مورد عميل مميز', 'عبدالعزيز حجازي', 'مورد عام 3', '55',
            'مورد مشتريات الموردين', 'احمد خالد', '555555', 'مؤسسة سليمان عبدالرحمن الحداد', 'مورد تجربة',
            '-', 'تجريبي516', 'Al-mraei', 'Al-mraei', 'شركة المراعي المحدودة', 'شركة كاسترول', 'نايف',
            'حميد', 'مورد تجريبي24', 'مورد خالد القحطاني للكفرات', 'مورد 33', 'مورد تجريبي 4 9', 'ملبوسات',
            'سشيشسي', 'تست اجل', 'شركة تجريبية', 'مورد جديد', 'مورد المراعي', 'علي عبدالقاهر', 'new vender',
            'تست تسلسل', 'مؤسسة خالد', 'يسشي', 'نننتت', 'علي', 'اسامة', 'فارس', 'اسماعيل', 'احمد صالح',
            'اسامه666', 'اسامة77', 'محمد', 'عبد العزيز', 'بلي', 'باحكيم', 'شركه الحوباني', 'شركه الجبل',
            'شركه الراجحي', 'شركه mbs', 'حبيب الوحيشي', 'حبيب', 'بلابل', 'قتيبة', 'عزالدين شاجع',
            'عزالدين شاجع', 'فرفوس', 'حازم الشعيبي', 'عز الدين شاجع', 'عبدالله علي', 'عبدالله حسان',
            'عزالدين', 'محلات القفيل', 'عزوز', 'صلاح', 'اكسيوم تيليكوم السعودية', 'trial supplier account',
            'محمد عتى', 'عبدالله', 'مورد تجريبي', 'احمد', 'حبيب', 'الشركة الوطنية', 'شركة المراعي',
            'عبدالله حسن للاكسسوارات النسائية', '12', 'محمد محمد', 'ععهف', 'ععهف', 'عبدالمجيد', 'عبدالعزيز',
            '333333333333', 'تاعا', '333333333333', '333333333333', 'علي', 'الهام', 'تجريبي-يدوي',
            'محمد احمد', 'مورد 404', 'احمد ابراهيم', 'شركة اكتسرا', 'عميل ومورد', 'عميل ومورد', 'كوك',
            'فوجى اتش دى', 'مورد 5', 'قتيبة سلطان القيسي', 'شركة زماني', 'شركة سويت', 'vendor1',
            'صلاح الدين', 'مورد 4', 'Supplier Test', 'النورس', 'ب', 'ب', 'تمام ردمان', 'Testing Vendor', 'test'
          ];

          // Generate 135 supplier accounts (from 202101000002 to 202101000136, but we have 135 names)
          for (let i = 2; i <= 136; i++) {
            const supplierNumber = String(i).padStart(6, '0');
            const supplierId = `202101000${supplierNumber}`;
            const supplierIndex = i - 2; // Index for supplierNames array
            const supplierName = supplierIndex < supplierNames.length ? supplierNames[supplierIndex] : `مورد ${supplierNumber}`;
            
            supplierAccounts.push({
              id: supplierId,
              code: supplierId,
              parentId: '202101',
              name: supplierName,
              nameEn: supplierName, // Using same name for English
              type: AccountType.LIABILITY,
              nature: AccountNature.CREDIT,
              level: 4,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: i - 1
            });
          }

          // 202102 - دائنون متنوعون
          const miscellaneousCreditorsAccount: Account = {
            id: '202102',
            code: '202102',
            parentId: '2021',
            name: 'دائنون متنوعون',
            nameEn: 'Miscellaneous Creditors',
            type: AccountType.LIABILITY,
            nature: AccountNature.CREDIT,
            level: 3,
            isParent: true,
            isActive: true,
            status: AccountStatus.ACTIVE,
            balance: 0,
            openingBalance: 0,
            currency: 'SAR',
            isSystemAccount: false,
            allowManualEntry: true,
            displayOrder: 2
          };

          // Children of 202102 - دائنون متنوعون
          const miscellaneousCreditorsChildren: Account[] = [
            {
              id: '20210201',
              code: '20210201',
              parentId: '202102',
              name: 'احمد السولي',
              nameEn: 'Ahmed Al-Soli',
              type: AccountType.LIABILITY,
              nature: AccountNature.CREDIT,
              level: 4,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 1
            },
            {
              id: '20210202',
              code: '20210202',
              parentId: '202102',
              name: 'سمير مصلح',
              nameEn: 'Samir Masleh',
              type: AccountType.LIABILITY,
              nature: AccountNature.CREDIT,
              level: 4,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 2
            },
            {
              id: '20210203',
              code: '20210203',
              parentId: '202102',
              name: 'مرتبات مستحقة',
              nameEn: 'Accrued Salaries',
              type: AccountType.LIABILITY,
              nature: AccountNature.CREDIT,
              level: 4,
              isParent: true,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 3
            }
          ];

          // Children of 20210203 - مرتبات مستحقة
          const accruedSalariesChildren: Account[] = [
            {
              id: '202102031',
              code: '202102031',
              parentId: '20210203',
              name: 'مرتبات مستحقة - عزوز',
              nameEn: 'Accrued Salaries - Azouz',
              type: AccountType.LIABILITY,
              nature: AccountNature.CREDIT,
              level: 5,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 1
            },
            {
              id: '202102032',
              code: '202102032',
              parentId: '20210203',
              name: 'مرتبات مستحقة - صالح محسن',
              nameEn: 'Accrued Salaries - Saleh Mohsen',
              type: AccountType.LIABILITY,
              nature: AccountNature.CREDIT,
              level: 5,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 2
            },
            {
              id: '202102033',
              code: '202102033',
              parentId: '20210203',
              name: 'مرتبات مستحقة - ايمن الحمادي',
              nameEn: 'Accrued Salaries - Ayman Al-Hamadi',
              type: AccountType.LIABILITY,
              nature: AccountNature.CREDIT,
              level: 5,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 3
            },
            {
              id: '202102034',
              code: '202102034',
              parentId: '20210203',
              name: 'مرتبات مستحقة - موسى الشهري',
              nameEn: 'Accrued Salaries - Mousa Al-Shehri',
              type: AccountType.LIABILITY,
              nature: AccountNature.CREDIT,
              level: 5,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 4
            },
            {
              id: '202102035',
              code: '202102035',
              parentId: '20210203',
              name: 'مرتبات مستحقة - مازن النهاري',
              nameEn: 'Accrued Salaries - Mazen Al-Nahari',
              type: AccountType.LIABILITY,
              nature: AccountNature.CREDIT,
              level: 5,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 5
            },
            {
              id: '202102036',
              code: '202102036',
              parentId: '20210203',
              name: 'مرتبات مستحقة - عبدالله الغامدي',
              nameEn: 'Accrued Salaries - Abdullah Al-Ghamdi',
              type: AccountType.LIABILITY,
              nature: AccountNature.CREDIT,
              level: 5,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 6
            }
          ];

          // 202103 - مراقبة المخزون
          const inventoryControlAccount: Account = {
            id: '202103',
            code: '202103',
            parentId: '2021',
            name: 'مراقبة المخزون',
            nameEn: 'Inventory Control',
            type: AccountType.LIABILITY,
            nature: AccountNature.CREDIT,
            level: 3,
            isParent: true,
            isActive: true,
            status: AccountStatus.ACTIVE,
            balance: 0,
            openingBalance: 0,
            currency: 'SAR',
            isSystemAccount: false,
            allowManualEntry: true,
            displayOrder: 3
          };

          // Child of 202103 - مراقبة المخزون
          const inventoryControlChild: Account = {
            id: '2021031',
            code: '2021031',
            parentId: '202103',
            name: 'مراقبة المخزون',
            nameEn: 'Inventory Control',
            type: AccountType.LIABILITY,
            nature: AccountNature.CREDIT,
            level: 4,
            isParent: false,
            isActive: true,
            status: AccountStatus.ACTIVE,
            balance: 0,
            openingBalance: 0,
            currency: 'SAR',
            isSystemAccount: false,
            allowManualEntry: true,
            displayOrder: 1
          };

          // Children of 2021 - الدائنون
          const creditors2021Children: Account[] = [
            suppliersAccount202101,
            miscellaneousCreditorsAccount,
            inventoryControlAccount
          ];

          // 2022 - ضريبة القيمة المضافة على المخرجات
          const outputVATAccount: Account = {
            id: '2022',
            code: '2022',
            parentId: '202',
            name: 'ضريبة القيمة المضافة على المخرجات',
            nameEn: 'VAT on Outputs',
            type: AccountType.LIABILITY,
            nature: AccountNature.CREDIT,
            level: 2,
            isParent: true,
            isActive: true,
            status: AccountStatus.ACTIVE,
            balance: 0,
            openingBalance: 0,
            currency: 'SAR',
            isSystemAccount: false,
            allowManualEntry: true,
            displayOrder: 2
          };

          // Child of 2022 - ضريبة القيمة المضافة على المخرجات
          const outputVATChild: Account = {
            id: '20221',
            code: '20221',
            parentId: '2022',
            name: 'ضريبة المبيعات',
            nameEn: 'Sales Tax',
            type: AccountType.LIABILITY,
            nature: AccountNature.CREDIT,
            level: 3,
            isParent: false,
            isActive: true,
            status: AccountStatus.ACTIVE,
            balance: 0,
            openingBalance: 0,
            currency: 'SAR',
            isSystemAccount: false,
            allowManualEntry: true,
            displayOrder: 1
          };

          // Children of 202 - الخصوم المتداولة
          const currentLiabilitiesChildren: Account[] = [
            creditorsAccount2021,
            outputVATAccount
          ];

          // Create nodes for Current Liabilities
          const supplierChildNodes: AccountTreeNode[] = supplierAccounts.map(acc => ({
            account: acc,
            children: [],
            expandable: false,
            level: 4
          }));

          const accruedSalariesChildNodes: AccountTreeNode[] = accruedSalariesChildren.map(acc => ({
            account: acc,
            children: [],
            expandable: false,
            level: 5
          }));

          const miscellaneousCreditorsChildNodes: AccountTreeNode[] = miscellaneousCreditorsChildren.map(acc => {
            const node: AccountTreeNode = {
              account: acc,
              children: [],
              expandable: acc.isParent,
              level: 4
            };
            if (acc.id === '20210203') {
              node.children = accruedSalariesChildNodes;
              node.expandable = true;
            }
            return node;
          });

          const inventoryControlChildNode: AccountTreeNode = {
            account: inventoryControlChild,
            children: [],
            expandable: false,
            level: 4
          };

          const creditors2021ChildNodes: AccountTreeNode[] = creditors2021Children.map(acc => {
            const node: AccountTreeNode = {
              account: acc,
              children: [],
              expandable: acc.isParent,
              level: 3
            };
            if (acc.id === '202101') {
              node.children = supplierChildNodes;
              node.expandable = true;
            } else if (acc.id === '202102') {
              node.children = miscellaneousCreditorsChildNodes;
              node.expandable = true;
            } else if (acc.id === '202103') {
              node.children = [inventoryControlChildNode];
              node.expandable = true;
            }
            return node;
          });

          const outputVATChildNode: AccountTreeNode = {
            account: outputVATChild,
            children: [],
            expandable: false,
            level: 3
          };

          const currentLiabilitiesChildNodes: AccountTreeNode[] = currentLiabilitiesChildren.map(acc => {
            const node: AccountTreeNode = {
              account: acc,
              children: [],
              expandable: acc.isParent,
              level: 2
            };
            if (acc.id === '2021') {
              node.children = creditors2021ChildNodes;
              node.expandable = true;
            } else if (acc.id === '2022') {
              node.children = [outputVATChildNode];
              node.expandable = true;
            }
            return node;
          });

          const currentLiabilitiesNode: AccountTreeNode = {
            account: currentLiabilitiesAccount,
            children: currentLiabilitiesChildNodes,
            expandable: true,
            level: 1
          };

          // Create Other Payables (203) children
          const otherPayablesChildren: Account[] = [
            {
              id: '2031',
              code: '2031',
              parentId: '203',
              name: 'الارباح المحتجزة قبل التوزيع',
              nameEn: 'Retained Earnings Before Distribution',
              type: AccountType.LIABILITY,
              nature: AccountNature.CREDIT,
              level: 2,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 1
            },
            {
              id: '2032',
              code: '2032',
              parentId: '203',
              name: 'مصروفات مستحقة',
              nameEn: 'Accrued Expenses',
              type: AccountType.LIABILITY,
              nature: AccountNature.CREDIT,
              level: 2,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 2
            }
          ];

          const otherPayablesChildNodes: AccountTreeNode[] = otherPayablesChildren.map(acc => ({
            account: acc,
            children: [],
            expandable: false,
            level: 2
          }));

          const otherPayablesNode: AccountTreeNode = {
            account: otherPayablesAccount,
            children: otherPayablesChildNodes,
            expandable: true,
            level: 1
          };

          const albawanCompanyNode: AccountTreeNode = {
            account: albawanCompanyAccount,
            children: [],
            expandable: false,
            level: 1
          };

          // Replace all nodes with the new structure
          typeNodes.push(fixedLiabilitiesNode);   // displayOrder: 1
          typeNodes.push(currentLiabilitiesNode); // displayOrder: 2
          typeNodes.push(otherPayablesNode);      // displayOrder: 3
          typeNodes.push(albawanCompanyNode);     // displayOrder: 4
        }

        // Special handling for EXPENSE type
        if (type === AccountType.EXPENSE) {
          // Clear existing nodes and build new structure
          typeNodes.length = 0;
          accountMap.clear();

          // Create المشتريات (31)
          const purchasesAccount: Account = {
            id: '31',
            code: '31',
            name: 'المشتريات',
            nameEn: 'Purchases',
            type: AccountType.EXPENSE,
            nature: AccountNature.DEBIT,
            level: 1,
            isParent: false,
            isActive: true,
            status: AccountStatus.ACTIVE,
            balance: 0,
            openingBalance: 0,
            currency: 'SAR',
            isSystemAccount: false,
            allowManualEntry: true,
            displayOrder: 1
          };

          // Create مردودات المبيعات (32)
          const salesReturnsAccount: Account = {
            id: '32',
            code: '32',
            name: 'مردودات المبيعات',
            nameEn: 'Sales Returns',
            type: AccountType.EXPENSE,
            nature: AccountNature.DEBIT,
            level: 1,
            isParent: false,
            isActive: true,
            status: AccountStatus.ACTIVE,
            balance: 0,
            openingBalance: 0,
            currency: 'SAR',
            isSystemAccount: false,
            allowManualEntry: true,
            displayOrder: 2
          };

          // Create المصروفات (33)
          const expensesAccount: Account = {
            id: '33',
            code: '33',
            name: 'المصروفات',
            nameEn: 'Expenses',
            type: AccountType.EXPENSE,
            nature: AccountNature.DEBIT,
            level: 1,
            isParent: true,
            isActive: true,
            status: AccountStatus.ACTIVE,
            balance: 0,
            openingBalance: 0,
            currency: 'SAR',
            isSystemAccount: false,
            allowManualEntry: true,
            displayOrder: 3
          };

          // Create اهلاك المخزون (34)
          const inventoryDepreciationAccount: Account = {
            id: '34',
            code: '34',
            name: 'اهلاك المخزون',
            nameEn: 'Inventory Depreciation',
            type: AccountType.EXPENSE,
            nature: AccountNature.DEBIT,
            level: 1,
            isParent: false,
            isActive: true,
            status: AccountStatus.ACTIVE,
            balance: 0,
            openingBalance: 0,
            currency: 'SAR',
            isSystemAccount: false,
            allowManualEntry: true,
            displayOrder: 4
          };

          // Create child accounts for 33 - المصروفات
          // 331 - المصروفات الادارية
          const administrativeExpensesAccount: Account = {
            id: '331',
            code: '331',
            parentId: '33',
            name: 'المصروفات الادارية',
            nameEn: 'Administrative Expenses',
            type: AccountType.EXPENSE,
            nature: AccountNature.DEBIT,
            level: 2,
            isParent: true,
            isActive: true,
            status: AccountStatus.ACTIVE,
            balance: 0,
            openingBalance: 0,
            currency: 'SAR',
            isSystemAccount: false,
            allowManualEntry: true,
            displayOrder: 1
          };

          // 3311 - مصروفات ادارية ـ خاصة بالمنشأة
          const facilityAdministrativeExpensesAccount: Account = {
            id: '3311',
            code: '3311',
            parentId: '331',
            name: 'مصروفات ادارية ـ خاصة بالمنشأة',
            nameEn: 'Facility Administrative Expenses',
            type: AccountType.EXPENSE,
            nature: AccountNature.DEBIT,
            level: 3,
            isParent: true,
            isActive: true,
            status: AccountStatus.ACTIVE,
            balance: 0,
            openingBalance: 0,
            currency: 'SAR',
            isSystemAccount: false,
            allowManualEntry: true,
            displayOrder: 1
          };

          // Children of 3311 - مصروفات ادارية ـ خاصة بالمنشأة
          const facilityAdministrativeExpensesChildren: Account[] = [
            {
              id: '331101',
              code: '331101',
              parentId: '3311',
              name: 'ايجارات',
              nameEn: 'Rent',
              type: AccountType.EXPENSE,
              nature: AccountNature.DEBIT,
              level: 4,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 1
            },
            {
              id: '331102',
              code: '331102',
              parentId: '3311',
              name: 'كهرباء',
              nameEn: 'Electricity',
              type: AccountType.EXPENSE,
              nature: AccountNature.DEBIT,
              level: 4,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 2
            },
            {
              id: '331103',
              code: '331103',
              parentId: '3311',
              name: 'مياه',
              nameEn: 'Water',
              type: AccountType.EXPENSE,
              nature: AccountNature.DEBIT,
              level: 4,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 3
            },
            {
              id: '331104',
              code: '331104',
              parentId: '3311',
              name: 'هاتف وانترنت',
              nameEn: 'Phone and Internet',
              type: AccountType.EXPENSE,
              nature: AccountNature.DEBIT,
              level: 4,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 4
            },
            {
              id: '331105',
              code: '331105',
              parentId: '3311',
              name: 'قرطاسية ومطبوعات',
              nameEn: 'Stationery and Printing',
              type: AccountType.EXPENSE,
              nature: AccountNature.DEBIT,
              level: 4,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 5
            },
            {
              id: '331106',
              code: '331106',
              parentId: '3311',
              name: 'ضيافة',
              nameEn: 'Hospitality',
              type: AccountType.EXPENSE,
              nature: AccountNature.DEBIT,
              level: 4,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 6
            },
            {
              id: '331107',
              code: '331107',
              parentId: '3311',
              name: 'نظافة',
              nameEn: 'Cleaning',
              type: AccountType.EXPENSE,
              nature: AccountNature.DEBIT,
              level: 4,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 7
            },
            {
              id: '331108',
              code: '331108',
              parentId: '3311',
              name: 'صيانة واصلاحات',
              nameEn: 'Maintenance and Repairs',
              type: AccountType.EXPENSE,
              nature: AccountNature.DEBIT,
              level: 4,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 8
            },
            {
              id: '331109',
              code: '331109',
              parentId: '3311',
              name: 'وقود وزيوت وقوى محركة',
              nameEn: 'Fuel, Oils and Motive Power',
              type: AccountType.EXPENSE,
              nature: AccountNature.DEBIT,
              level: 4,
              isParent: true,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 9
            },
            {
              id: '331110',
              code: '331110',
              parentId: '3311',
              name: 'عمولات بنكية',
              nameEn: 'Bank Commissions',
              type: AccountType.EXPENSE,
              nature: AccountNature.DEBIT,
              level: 4,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 10
            },
            {
              id: '331111',
              code: '331111',
              parentId: '3311',
              name: 'مصروفات الاكل والشرب',
              nameEn: 'Food and Beverage Expenses',
              type: AccountType.EXPENSE,
              nature: AccountNature.DEBIT,
              level: 4,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 11
            }
          ];

          // Children of 331109 - وقود وزيوت وقوى محركة
          const fuelAndOilsChildren: Account[] = [
            {
              id: '3311091',
              code: '3311091',
              parentId: '331109',
              name: 'بترول',
              nameEn: 'Petrol',
              type: AccountType.EXPENSE,
              nature: AccountNature.DEBIT,
              level: 5,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 1
            },
            {
              id: '3311092',
              code: '3311092',
              parentId: '331109',
              name: 'ديزل',
              nameEn: 'Diesel',
              type: AccountType.EXPENSE,
              nature: AccountNature.DEBIT,
              level: 5,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 2
            },
            {
              id: '3311093',
              code: '3311093',
              parentId: '331109',
              name: 'غاز',
              nameEn: 'Gas',
              type: AccountType.EXPENSE,
              nature: AccountNature.DEBIT,
              level: 5,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 3
            },
            {
              id: '3311094',
              code: '3311094',
              parentId: '331109',
              name: 'تغيير زيوت سيارات',
              nameEn: 'Car Oil Change',
              type: AccountType.EXPENSE,
              nature: AccountNature.DEBIT,
              level: 5,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 4
            }
          ];

          // 3312 - مصروفات ادارية ـ خاصة بالموظفين
          const employeeAdministrativeExpensesAccount: Account = {
            id: '3312',
            code: '3312',
            parentId: '331',
            name: 'مصروفات ادارية ـ خاصة بالموظفين',
            nameEn: 'Employee Administrative Expenses',
            type: AccountType.EXPENSE,
            nature: AccountNature.DEBIT,
            level: 3,
            isParent: true,
            isActive: true,
            status: AccountStatus.ACTIVE,
            balance: 0,
            openingBalance: 0,
            currency: 'SAR',
            isSystemAccount: false,
            allowManualEntry: true,
            displayOrder: 2
          };

          // Children of 3312 - مصروفات ادارية ـ خاصة بالموظفين
          const employeeAdministrativeExpensesChildren: Account[] = [
            {
              id: '331201',
              code: '331201',
              parentId: '3312',
              name: 'مرتبات واجور',
              nameEn: 'Salaries and Wages',
              type: AccountType.EXPENSE,
              nature: AccountNature.DEBIT,
              level: 4,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 1
            },
            {
              id: '331202',
              code: '331202',
              parentId: '3312',
              name: 'اجر عمل اضافي',
              nameEn: 'Overtime Pay',
              type: AccountType.EXPENSE,
              nature: AccountNature.DEBIT,
              level: 4,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 2
            },
            {
              id: '331203',
              code: '331203',
              parentId: '3312',
              name: 'سفر وانتقال داخلي ـ موظفين',
              nameEn: 'Internal Travel and Transportation - Employees',
              type: AccountType.EXPENSE,
              nature: AccountNature.DEBIT,
              level: 4,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 3
            },
            {
              id: '331204',
              code: '331204',
              parentId: '3312',
              name: 'بدل تذاكر سفر خارجي ـ موظفين',
              nameEn: 'International Travel Allowance - Employees',
              type: AccountType.EXPENSE,
              nature: AccountNature.DEBIT,
              level: 4,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 4
            },
            {
              id: '331205',
              code: '331205',
              parentId: '3312',
              name: 'التأمين الصحي',
              nameEn: 'Health Insurance',
              type: AccountType.EXPENSE,
              nature: AccountNature.DEBIT,
              level: 4,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 5
            },
            {
              id: '331206',
              code: '331206',
              parentId: '3312',
              name: 'بدل سكن ـ موظفين',
              nameEn: 'Housing Allowance - Employees',
              type: AccountType.EXPENSE,
              nature: AccountNature.DEBIT,
              level: 4,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 6
            },
            {
              id: '331207',
              code: '331207',
              parentId: '3312',
              name: 'مصاريف الاستقدام',
              nameEn: 'Recruitment Expenses',
              type: AccountType.EXPENSE,
              nature: AccountNature.DEBIT,
              level: 4,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 7
            },
            {
              id: '331208',
              code: '331208',
              parentId: '3312',
              name: 'بدل مواصلات',
              nameEn: 'Transportation Allowance',
              type: AccountType.EXPENSE,
              nature: AccountNature.DEBIT,
              level: 4,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 8
            },
            {
              id: '331209',
              code: '331209',
              parentId: '3312',
              name: 'تغذية العاملين',
              nameEn: 'Employee Meals',
              type: AccountType.EXPENSE,
              nature: AccountNature.DEBIT,
              level: 4,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 9
            }
          ];

          // Children of 331 - المصروفات الادارية
          const administrativeExpensesChildren: Account[] = [
            facilityAdministrativeExpensesAccount,
            employeeAdministrativeExpensesAccount
          ];

          // Children of 33 - المصروفات
          const expensesChildren: Account[] = [
            administrativeExpensesAccount,
            {
              id: '332',
              code: '332',
              parentId: '33',
              name: 'المصروفات البيعية',
              nameEn: 'Selling Expenses',
              type: AccountType.EXPENSE,
              nature: AccountNature.DEBIT,
              level: 2,
              isParent: true,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 2
            },
            {
              id: '333',
              code: '333',
              parentId: '33',
              name: 'المصروفات التسويقية',
              nameEn: 'Marketing Expenses',
              type: AccountType.EXPENSE,
              nature: AccountNature.DEBIT,
              level: 2,
              isParent: true,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 3
            },
            {
              id: '334',
              code: '334',
              parentId: '33',
              name: 'رسوم حكومية',
              nameEn: 'Government Fees',
              type: AccountType.EXPENSE,
              nature: AccountNature.DEBIT,
              level: 2,
              isParent: true,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 4
            },
            {
              id: '335',
              code: '335',
              parentId: '33',
              name: 'مصروفات اخرى',
              nameEn: 'Other Expenses',
              type: AccountType.EXPENSE,
              nature: AccountNature.DEBIT,
              level: 2,
              isParent: true,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 5
            },
            {
              id: '336',
              code: '336',
              parentId: '33',
              name: 'بضاعة التالفة والمستهلكة والمنتهية الصلاحية',
              nameEn: 'Damaged, Consumed and Expired Goods',
              type: AccountType.EXPENSE,
              nature: AccountNature.DEBIT,
              level: 2,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 6
            },
            {
              id: '337',
              code: '337',
              parentId: '33',
              name: 'مصروفات مصطفى',
              nameEn: 'Mostafa Expenses',
              type: AccountType.EXPENSE,
              nature: AccountNature.DEBIT,
              level: 2,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 7
            },
            {
              id: '338',
              code: '338',
              parentId: '33',
              name: 'حساب بسام',
              nameEn: 'Bassam Account',
              type: AccountType.EXPENSE,
              nature: AccountNature.DEBIT,
              level: 2,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 8
            },
            {
              id: '339',
              code: '339',
              parentId: '33',
              name: 'مرتجع مشتريات',
              nameEn: 'Purchase Returns',
              type: AccountType.EXPENSE,
              nature: AccountNature.DEBIT,
              level: 2,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 9
            }
          ];

          // Children of 332 - المصروفات البيعية
          const sellingExpensesChildren: Account[] = [
            {
              id: '3321',
              code: '3321',
              parentId: '332',
              name: 'تكلفة المبيعات',
              nameEn: 'Cost of Sales',
              type: AccountType.EXPENSE,
              nature: AccountNature.DEBIT,
              level: 3,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 1
            }
          ];

          // Children of 333 - المصروفات التسويقية
          const marketingExpensesChildren: Account[] = [
            {
              id: '3331',
              code: '3331',
              parentId: '333',
              name: 'مصروفات الدعاية والاعلان',
              nameEn: 'Advertising and Promotion Expenses',
              type: AccountType.EXPENSE,
              nature: AccountNature.DEBIT,
              level: 3,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 1
            },
            {
              id: '3332',
              code: '3332',
              parentId: '333',
              name: 'الهدايا والعينات الترويجية',
              nameEn: 'Gifts and Promotional Samples',
              type: AccountType.EXPENSE,
              nature: AccountNature.DEBIT,
              level: 3,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 2
            },
            {
              id: '3333',
              code: '3333',
              parentId: '333',
              name: 'مصروفات حملات التسويق الرقمي',
              nameEn: 'Digital Marketing Campaign Expenses',
              type: AccountType.EXPENSE,
              nature: AccountNature.DEBIT,
              level: 3,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 3
            }
          ];

          // Children of 334 - رسوم حكومية
          const governmentFeesChildren: Account[] = [
            {
              id: '3341',
              code: '3341',
              parentId: '334',
              name: 'رسوم تجديد اقامة',
              nameEn: 'Residence Renewal Fees',
              type: AccountType.EXPENSE,
              nature: AccountNature.DEBIT,
              level: 3,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 1
            },
            {
              id: '3342',
              code: '3342',
              parentId: '334',
              name: 'رسوم المقابل المالي',
              nameEn: 'Financial Correspondent Fees',
              type: AccountType.EXPENSE,
              nature: AccountNature.DEBIT,
              level: 3,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 2
            },
            {
              id: '3343',
              code: '3343',
              parentId: '334',
              name: 'رسوم مكتب العمل',
              nameEn: 'Labor Office Fees',
              type: AccountType.EXPENSE,
              nature: AccountNature.DEBIT,
              level: 3,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 3
            },
            {
              id: '3344',
              code: '3344',
              parentId: '334',
              name: 'تأشيرة الخروج والعودة',
              nameEn: 'Exit and Re-entry Visa',
              type: AccountType.EXPENSE,
              nature: AccountNature.DEBIT,
              level: 3,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 4
            },
            {
              id: '3345',
              code: '3345',
              parentId: '334',
              name: 'رسوم التراخيص والسجلات التجارية',
              nameEn: 'Licenses and Commercial Registration Fees',
              type: AccountType.EXPENSE,
              nature: AccountNature.DEBIT,
              level: 3,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 5
            },
            {
              id: '3346',
              code: '3346',
              parentId: '334',
              name: 'رسوم تجديد الاقامات',
              nameEn: 'Residence Renewal Fees',
              type: AccountType.EXPENSE,
              nature: AccountNature.DEBIT,
              level: 3,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 6
            },
            {
              id: '3347',
              code: '3347',
              parentId: '334',
              name: 'رسوم مكتب العمل',
              nameEn: 'Labor Office Fees',
              type: AccountType.EXPENSE,
              nature: AccountNature.DEBIT,
              level: 3,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 7
            },
            {
              id: '3348',
              code: '3348',
              parentId: '334',
              name: 'رسوم المقابل المالي',
              nameEn: 'Financial Correspondent Fees',
              type: AccountType.EXPENSE,
              nature: AccountNature.DEBIT,
              level: 3,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 8
            }
          ];

          // Children of 335 - مصروفات اخرى
          const otherExpensesChildren: Account[] = [
            {
              id: '3351',
              code: '3351',
              parentId: '335',
              name: 'الخصم المسموح به',
              nameEn: 'Allowed Discount',
              type: AccountType.EXPENSE,
              nature: AccountNature.DEBIT,
              level: 3,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 1
            }
          ];

          // Create nodes for expenses
          const fuelAndOilsChildNodes: AccountTreeNode[] = fuelAndOilsChildren.map(acc => ({
            account: acc,
            children: [],
            expandable: false,
            level: 5
          }));

          const facilityAdministrativeExpensesChildNodes: AccountTreeNode[] = facilityAdministrativeExpensesChildren.map(acc => {
            const node: AccountTreeNode = {
              account: acc,
              children: [],
              expandable: acc.isParent,
              level: 4
            };
            if (acc.id === '331109') {
              node.children = fuelAndOilsChildNodes;
              node.expandable = true;
            }
            return node;
          });

          const employeeAdministrativeExpensesChildNodes: AccountTreeNode[] = employeeAdministrativeExpensesChildren.map(acc => ({
            account: acc,
            children: [],
            expandable: false,
            level: 4
          }));

          const administrativeExpensesChildNodes: AccountTreeNode[] = administrativeExpensesChildren.map(acc => {
            const node: AccountTreeNode = {
              account: acc,
              children: [],
              expandable: acc.isParent,
              level: 3
            };
            if (acc.id === '3311') {
              node.children = facilityAdministrativeExpensesChildNodes;
              node.expandable = true;
            } else if (acc.id === '3312') {
              node.children = employeeAdministrativeExpensesChildNodes;
              node.expandable = true;
            }
            return node;
          });

          const sellingExpensesChildNodes: AccountTreeNode[] = sellingExpensesChildren.map(acc => ({
            account: acc,
            children: [],
            expandable: false,
            level: 3
          }));

          const marketingExpensesChildNodes: AccountTreeNode[] = marketingExpensesChildren.map(acc => ({
            account: acc,
            children: [],
            expandable: false,
            level: 3
          }));

          const governmentFeesChildNodes: AccountTreeNode[] = governmentFeesChildren.map(acc => ({
            account: acc,
            children: [],
            expandable: false,
            level: 3
          }));

          const otherExpensesChildNodes: AccountTreeNode[] = otherExpensesChildren.map(acc => ({
            account: acc,
            children: [],
            expandable: false,
            level: 3
          }));

          const expensesChildNodes: AccountTreeNode[] = expensesChildren.map(acc => {
            const node: AccountTreeNode = {
              account: acc,
              children: [],
              expandable: acc.isParent,
              level: 2
            };
            if (acc.id === '331') {
              node.children = administrativeExpensesChildNodes;
              node.expandable = true;
            } else if (acc.id === '332') {
              node.children = sellingExpensesChildNodes;
              node.expandable = true;
            } else if (acc.id === '333') {
              node.children = marketingExpensesChildNodes;
              node.expandable = true;
            } else if (acc.id === '334') {
              node.children = governmentFeesChildNodes;
              node.expandable = true;
            } else if (acc.id === '335') {
              node.children = otherExpensesChildNodes;
              node.expandable = true;
            }
            return node;
          });

          const purchasesNode: AccountTreeNode = {
            account: purchasesAccount,
            children: [],
            expandable: false,
            level: 1
          };

          const salesReturnsNode: AccountTreeNode = {
            account: salesReturnsAccount,
            children: [],
            expandable: false,
            level: 1
          };

          const expensesNode: AccountTreeNode = {
            account: expensesAccount,
            children: expensesChildNodes,
            expandable: true,
            level: 1
          };

          const inventoryDepreciationNode: AccountTreeNode = {
            account: inventoryDepreciationAccount,
            children: [],
            expandable: false,
            level: 1
          };

          // Replace all nodes with the new structure
          typeNodes.push(purchasesNode);             // displayOrder: 1
          typeNodes.push(salesReturnsNode);          // displayOrder: 2
          typeNodes.push(expensesNode);              // displayOrder: 3
          typeNodes.push(inventoryDepreciationNode); // displayOrder: 4
        }

        // Special handling for REVENUE type
        if (type === AccountType.REVENUE) {
          // Clear existing nodes and build new structure
          typeNodes.length = 0;
          accountMap.clear();

          // Create المبيعات (401)
          const salesAccount: Account = {
            id: '401',
            code: '401',
            name: 'المبيعات',
            nameEn: 'Sales',
            type: AccountType.REVENUE,
            nature: AccountNature.CREDIT,
            level: 1,
            isParent: false,
            isActive: true,
            status: AccountStatus.ACTIVE,
            balance: 0,
            openingBalance: 0,
            currency: 'SAR',
            isSystemAccount: false,
            allowManualEntry: true,
            displayOrder: 1
          };

          // Create مردودات المشتريات (402)
          const purchaseReturnsAccount: Account = {
            id: '402',
            code: '402',
            name: 'مردودات المشتريات',
            nameEn: 'Purchase Returns',
            type: AccountType.REVENUE,
            nature: AccountNature.CREDIT,
            level: 1,
            isParent: false,
            isActive: true,
            status: AccountStatus.ACTIVE,
            balance: 0,
            openingBalance: 0,
            currency: 'SAR',
            isSystemAccount: false,
            allowManualEntry: true,
            displayOrder: 2
          };

          // Create ايرادات اخرى (403)
          const otherRevenuesAccount: Account = {
            id: '403',
            code: '403',
            name: 'ايرادات اخرى',
            nameEn: 'Other Revenues',
            type: AccountType.REVENUE,
            nature: AccountNature.CREDIT,
            level: 1,
            isParent: true,
            isActive: true,
            status: AccountStatus.ACTIVE,
            balance: 0,
            openingBalance: 0,
            currency: 'SAR',
            isSystemAccount: false,
            allowManualEntry: true,
            displayOrder: 3
          };

          // Create الراجحي (404)
          const alRajhiAccount: Account = {
            id: '404',
            code: '404',
            name: 'الراجحي',
            nameEn: 'Al Rajhi',
            type: AccountType.REVENUE,
            nature: AccountNature.CREDIT,
            level: 1,
            isParent: false,
            isActive: true,
            status: AccountStatus.ACTIVE,
            balance: 0,
            openingBalance: 0,
            currency: 'SAR',
            isSystemAccount: false,
            allowManualEntry: true,
            displayOrder: 4
          };

          // Create المبيعات الآجلة (405)
          const creditSalesAccount: Account = {
            id: '405',
            code: '405',
            name: 'المبيعات الآجلة',
            nameEn: 'Credit Sales',
            type: AccountType.REVENUE,
            nature: AccountNature.CREDIT,
            level: 1,
            isParent: false,
            isActive: true,
            status: AccountStatus.ACTIVE,
            balance: 0,
            openingBalance: 0,
            currency: 'SAR',
            isSystemAccount: false,
            allowManualEntry: true,
            displayOrder: 5
          };

          // Children of 403 - ايرادات اخرى
          const otherRevenuesChildren: Account[] = [
            {
              id: '40301',
              code: '40301',
              parentId: '403',
              name: 'الخصم المكتسب',
              nameEn: 'Earned Discount',
              type: AccountType.REVENUE,
              nature: AccountNature.CREDIT,
              level: 2,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 1
            },
            {
              id: '40328',
              code: '40328',
              parentId: '403',
              name: '17',
              nameEn: '17',
              type: AccountType.REVENUE,
              nature: AccountNature.CREDIT,
              level: 2,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 2
            },
            {
              id: '40329',
              code: '40329',
              parentId: '403',
              name: '18',
              nameEn: '18',
              type: AccountType.REVENUE,
              nature: AccountNature.CREDIT,
              level: 2,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 3
            },
            {
              id: '40330',
              code: '40330',
              parentId: '403',
              name: '19',
              nameEn: '19',
              type: AccountType.REVENUE,
              nature: AccountNature.CREDIT,
              level: 2,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 4
            },
            {
              id: '40331',
              code: '40331',
              parentId: '403',
              name: '20',
              nameEn: '20',
              type: AccountType.REVENUE,
              nature: AccountNature.CREDIT,
              level: 2,
              isParent: false,
              isActive: true,
              status: AccountStatus.ACTIVE,
              balance: 0,
              openingBalance: 0,
              currency: 'SAR',
              isSystemAccount: false,
              allowManualEntry: true,
              displayOrder: 5
            }
          ];

          // Create nodes for revenue accounts
          const otherRevenuesChildNodes: AccountTreeNode[] = otherRevenuesChildren.map(acc => ({
            account: acc,
            children: [],
            expandable: false,
            level: 2
          }));

          const salesNode: AccountTreeNode = {
            account: salesAccount,
            children: [],
            expandable: false,
            level: 1
          };

          const purchaseReturnsNode: AccountTreeNode = {
            account: purchaseReturnsAccount,
            children: [],
            expandable: false,
            level: 1
          };

          const otherRevenuesNode: AccountTreeNode = {
            account: otherRevenuesAccount,
            children: otherRevenuesChildNodes,
            expandable: true,
            level: 1
          };

          const alRajhiNode: AccountTreeNode = {
            account: alRajhiAccount,
            children: [],
            expandable: false,
            level: 1
          };

          const creditSalesNode: AccountTreeNode = {
            account: creditSalesAccount,
            children: [],
            expandable: false,
            level: 1
          };

          // Replace all nodes with the new structure
          typeNodes.push(salesNode);              // displayOrder: 1
          typeNodes.push(purchaseReturnsNode);    // displayOrder: 2
          typeNodes.push(otherRevenuesNode);      // displayOrder: 3
          typeNodes.push(alRajhiNode);            // displayOrder: 4
          typeNodes.push(creditSalesNode);        // displayOrder: 5
        }

        // Sort nodes
        const sortNodes = (nodes: AccountTreeNode[]) => {
          nodes.sort((a, b) => a.account.displayOrder - b.account.displayOrder);
          nodes.forEach(node => {
            if (node.children && node.children.length > 0) {
              sortNodes(node.children);
            }
          });
        };

        sortNodes(typeNodes);

        // Create root node for this type
        const typeRootNode: AccountTreeNode = {
          account: virtualParent,
          children: typeNodes.length > 0 ? typeNodes : [],
          expandable: typeNodes.length > 0,
          level: 0
        };

        // Debug: Log for ASSET type
        if (type === AccountType.ASSET) {
          console.log('ASSET Type Root Node:', {
            id: typeRootNode.account.id,
            expandable: typeRootNode.expandable,
            childrenCount: typeRootNode.children?.length,
            children: typeRootNode.children?.map(c => `${c.account.code} - ${c.account.name}`)
          });
        }

        rootNodes.push(typeRootNode);
      }
    });

    return rootNodes;
  }

  /**
   * Check if node has children
   */
  hasChild = (_: number, node: AccountTreeNode): boolean => {
    const hasChildren = !!node.children && node.children.length > 0;
    // Debug for ASSET type root
    if (node.account.id.startsWith('type-') && node.account.type === AccountType.ASSET) {
      console.log('hasChild check for ASSET type root:', {
        id: node.account.id,
        children: node.children,
        childrenLength: node.children?.length,
        hasChildren
      });
    }
    return hasChildren;
  };

  /**
   * Get Account Type Color
   */
  getAccountTypeColor(type: AccountType): any {
    return this.accountTypeColors[type] || { bg: '#f5f5f5', text: '#424242', border: '#9e9e9e' };
  }

  /**
   * Search Accounts
   */
  onSearch(query: string): void {
    this.searchQuery.set(query);
    
    if (!query || query.trim() === '') {
      this.filteredAccounts.set([]);
      this.loadChartOfAccounts();
      return;
    }

    const results = this.chartService.searchAccounts(query, this.dir() === 'rtl' ? 'ar' : 'en');
    this.filteredAccounts.set(results);

  }

  /**
   * Clear Search
   */
  clearSearch(): void {
    this.searchQuery.set('');
    this.filteredAccounts.set([]);
    this.loadChartOfAccounts();
  }

  /**
   * Get Account Display Name
   */
  getAccountDisplayName(account: Account): string {
    return this.dir() === 'rtl' ? account.name : account.nameEn;
  }

  /**
   * Get Type Name Without Number
   */
  getTypeNameWithoutNumber(account: Account): string {
    const displayName = this.getAccountDisplayName(account);
    // Remove number prefix (e.g., "1. الأصول" -> "الأصول")
    return displayName.replace(/^\d+\.\s*/, '');
  }

  /**
   * Get Account Nature Text (له or عليه)
   */
  getAccountNatureText(account: Account): string {
    // Assets and Expenses are "له" (Debit nature)
    // Liabilities, Equity, and Revenue are "عليه" (Credit nature)
    if (account.type === AccountType.ASSET || account.type === AccountType.EXPENSE) {
      return 'له';
    } else if (account.type === AccountType.LIABILITY || account.type === AccountType.EQUITY || account.type === AccountType.REVENUE) {
      return 'عليه';
    }
    return '';
  }

  /**
   * Format Currency
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Get Normal Balance Label
   */
  getNormalBalanceLabel(nature: string): string {
    return nature === 'debit' ? 'مدين' : 'دائن';
  }

  /**
   * Expand All
   */
  expandAll(): void {
    this.treeControl.expandAll();
  }

  /**
   * Collapse All
   */
  collapseAll(): void {
    this.treeControl.collapseAll();
  }

  /**
   * Export to Excel
   */
  exportToExcel(): void {
    try {
      const accounts = this.chartService.getAllAccounts();
      const headers = [
        'رقم الحساب',
        'اسم الحساب',
        'اسم الحساب (إنجليزي)',
        'نوع الحساب',
        'الرصيد',
        'الطبيعة'
      ];

      const rows = accounts
        .filter(account => !account.isParent) // Only leaf accounts
        .map(account => [
          account.code,
          account.name,
          account.nameEn || '',
          this.getAccountTypeLabel(account.type),
          this.formatCurrency(account.balance ?? 0),
          account.nature === 'debit' ? 'مدين' : 'دائن'
        ]);

      // Create CSV content with BOM for UTF-8
      let csvContent = '\uFEFF' + headers.join(',') + '\n';
      rows.forEach(row => {
        csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
      });

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `chart_of_accounts_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
    }
  }

  /**
   * Get Account Type Label
   */
  getAccountTypeLabel(type: AccountType): string {
    const labels: { [key: string]: string } = {
      [AccountType.ASSET]: 'أصل',
      [AccountType.LIABILITY]: 'خصم',
      [AccountType.EQUITY]: 'ملكية',
      [AccountType.REVENUE]: 'إيراد',
      [AccountType.EXPENSE]: 'مصروف'
    };
    return labels[type] || type;
  }

  /**
   * Add Child Account
   * إضافة حساب فرعي
   */
  addChildAccount(account: Account): void {
    const dialogData: AddAccountDialogData = {
      parentAccount: account
    };

    const dialogRef = this.dialog.open(AddAccountDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
      data: dialogData,
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // TODO: Implement actual save logic
        console.log('New account data:', result);
        console.log('Parent account:', account);
        
        // Refresh tree after adding account
        // this.loadChartOfAccounts();
      }
    });
  }

  /**
   * Edit Account
   * تعديل الحساب
   */
  editAccount(account: Account): void {
    const dialogData: AddAccountDialogData = {
      account: account,
      mode: 'edit'
    };

    const dialogRef = this.dialog.open(AddAccountDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
      data: dialogData,
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // TODO: Implement actual update logic
        console.log('Updated account data:', result);
        console.log('Account:', account);
        
        // Refresh tree after updating account
        // this.loadChartOfAccounts();
      }
    });
  }

  /**
   * Add Account Code Field
   * إضافة خانة كود
   */
  addAccountCode(account: Account): void {
    const dialogData: AddCodeDialogData = {
      account: account
    };

    const dialogRef = this.dialog.open(AddCodeDialogComponent, {
      width: '550px',
      maxWidth: '95vw',
      data: dialogData,
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // TODO: Implement actual code field addition logic
        console.log('Adding code field for account:', account);
        console.log('This will add a zero field to the account code and all child accounts');
        
        // Refresh tree after adding code field
        // this.loadChartOfAccounts();
      }
    });
  }

  // ── Section + node controls ──────────────────────────────────────

  toggleSection(typeId: string): void {
    const next = new Set(this.openSections());
    next.has(typeId) ? next.delete(typeId) : next.add(typeId);
    this.openSections.set(next);
  }

  isSectionOpen(typeId: string): boolean {
    return this.openSections().has(typeId);
  }

  toggleNode(nodeId: string): void {
    const next = new Set(this.nodeExpandedSet());
    next.has(nodeId) ? next.delete(nodeId) : next.add(nodeId);
    this.nodeExpandedSet.set(next);
  }

  isNodeExpanded(nodeId: string): boolean {
    return this.nodeExpandedSet().has(nodeId);
  }

  // ── Zero-padding feature ─────────────────────────────────────────

  openZeroPaddingDialog(cat: { label: string; type: AccountType; rootNode: AccountTreeNode }): void {
    const preview = this.buildZeroPaddingPreview(cat.rootNode.children ?? [], 0);
    const ref = this.dialog.open(ZeroPaddingDialogComponent, {
      width: '540px',
      maxWidth: '95vw',
      data: { categoryLabel: cat.label, categoryType: cat.type, preview } as ZeroPaddingDialogData,
      disableClose: false,
      panelClass: 'zpd-panel',
    });
    ref.afterClosed().subscribe(confirmed => {
      if (confirmed) this.applyZeroPadding(cat.rootNode);
    });
  }

  openZeroPaddingDialogForNode(item: FlatItem): void {
    const node = this.findNode(item.account.id, this.boardData());
    if (!node) return;
    const preview = this.buildZeroPaddingPreview([node], 0);
    const ref = this.dialog.open(ZeroPaddingDialogComponent, {
      width: '540px',
      maxWidth: '95vw',
      data: {
        categoryLabel: this.getAccountDisplayName(item.account),
        categoryType:  item.account.type,
        preview,
      } as ZeroPaddingDialogData,
      disableClose: false,
      panelClass: 'zpd-panel',
    });
    ref.afterClosed().subscribe(confirmed => {
      if (confirmed) this.applyZeroPadding(node);
    });
  }

  private findNode(id: string, nodes: AccountTreeNode[]): AccountTreeNode | null {
    for (const node of nodes) {
      if (node.account.id === id) return node;
      if (node.children?.length) {
        const found = this.findNode(id, node.children);
        if (found) return found;
      }
    }
    return null;
  }

  private buildZeroPaddingPreview(nodes: AccountTreeNode[], depth: number): ZeroPaddingPreviewRow[] {
    const rows: ZeroPaddingPreviewRow[] = [];
    nodes.forEach(node => {
      rows.push({
        oldCode: node.account.code,
        newCode: node.account.code + '0',
        name:    this.getAccountDisplayName(node.account),
        depth,
      });
      if (node.children?.length) {
        rows.push(...this.buildZeroPaddingPreview(node.children, depth + 1));
      }
    });
    return rows;
  }

  private applyZeroPadding(rootNode: AccountTreeNode): void {
    const updatedIds = new Set<string>();
    const walk = (nodes: AccountTreeNode[]) => {
      nodes.forEach(node => {
        node.account.code = node.account.code + '0';
        updatedIds.add(node.account.id);
        if (node.children?.length) walk(node.children);
      });
    };
    rootNode.account.code = rootNode.account.code + '0';
    walk(rootNode.children ?? []);
    this.boardData.update(d => [...d]);
    this.updatedCodeIds.set(updatedIds);
    setTimeout(() => this.updatedCodeIds.set(new Set()), 1800);
  }

  private flattenAll(nodes: AccountTreeNode[], depth = 1): FlatItem[] {
    const result: FlatItem[] = [];
    nodes.forEach(node => {
      const hasChildren = !!(node.children?.length);
      result.push({ account: node.account, depth, hasChildren });
      if (hasChildren) result.push(...this.flattenAll(node.children!, depth + 1));
    });
    return result;
  }

  private flattenVisible(nodes: AccountTreeNode[], depth: number, expanded: Set<string>): FlatItem[] {
    const result: FlatItem[] = [];
    nodes.forEach(node => {
      const hasChildren = !!(node.children?.length);
      result.push({ account: node.account, depth, hasChildren });
      if (hasChildren && expanded.has(node.account.id)) {
        result.push(...this.flattenVisible(node.children!, depth + 1, expanded));
      }
    });
    return result;
  }

  addRootAccount(): void {
    this.dialog.open(AddAccountDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
      data: {} as AddAccountDialogData,
      disableClose: false,
    });
  }

  getAccountTypeIcon(type: AccountType): string {
    return ({
      [AccountType.ASSET]:     'archive',
      [AccountType.LIABILITY]: 'credit-card',
      [AccountType.EQUITY]:    'certificate',
      [AccountType.EXPENSE]:   'trending-up',
      [AccountType.REVENUE]:   'coins',
    } as Record<string, string>)[type] ?? 'folder';
  }

  /**
   * Delete Account
   */
  deleteAccount(account: Account): void {
    const dialogData: DeleteAccountDialogData = {
      account: account
    };

    const dialogRef = this.dialog.open(DeleteAccountDialogComponent, {
      width: '550px',
      maxWidth: '95vw',
      data: dialogData,
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // TODO: Implement actual account deletion logic
        console.log('Deleting account:', account);
        
        // Refresh tree after deletion
        // this.loadChartOfAccounts();
      }
    });
  }
}
