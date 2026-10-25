import type { DbState, Group, Order, Product, User } from './types'

type SeedUser = Omit<User, 'passwordHash'> & { password: string }

export type SeedDraft = Omit<DbState, 'users' | 'outbox' | 'presence' | 'revision'> & {
  users: SeedUser[]
}

const photo = '/monitor.svg'

function product(
  partial: Pick<Product, 'id' | 'title' | 'orderId' | 'type' | 'specification' | 'price'> &
    Partial<Product>,
): Product {
  return {
    serialNumber: 'SN-100000',
    isNew: true,
    photo,
    status: 'free',
    guaranteeStart: '2017-04-06',
    guaranteeEnd: '2025-08-06',
    groupId: null,
    userId: null,
    createdAt: '2017-06-29',
    ...partial,
  }
}

export function buildSeed(): SeedDraft {
  const users: SeedUser[] = [
    { id: 1, name: 'Демо Пользователь', login: 'demo', password: 'demo' },
    { id: 2, name: 'Христорождественский Александр', login: 'alexander', password: 'disabled-alexander' },
    { id: 3, name: 'Ирина Коваль', login: 'irina', password: 'disabled-irina' },
  ]

  const groups: Group[] = [
    { id: 1, name: 'Длинное предлинное длиннющее название группы' },
    { id: 2, name: 'Склад Киев' },
    { id: 3, name: 'Офис' },
  ]

  const orders: Order[] = [
    {
      id: 1,
      title: 'Длинное предлинное длиннющее длиннющее название прихода',
      description: 'Поставка мониторов на склад',
      createdAt: '2017-10-06',
    },
    {
      id: 2,
      title: 'Длинное название прихода',
      description: 'Клавиатуры',
      createdAt: '2017-09-06',
    },
    {
      id: 3,
      title: 'Длинное предлинное длиннющее название прихода',
      description: 'Смешанная партия',
      createdAt: '2017-06-06',
    },
    {
      id: 4,
      title: 'Длинное предлинное название прихода',
      description: 'Принтеры',
      createdAt: '2017-02-06',
    },
    {
      id: 5,
      title: 'Приход периферии для офиса',
      description: '',
      createdAt: '2017-12-19',
    },
    {
      id: 6,
      title: 'Серверные комплектующие',
      description: '',
      createdAt: '2017-04-12',
    },
  ]

  const products: Product[] = [
    product({
      id: 1,
      title: 'Gigabyte Technology X58-USB3 (Socket 1366) 6 X58-USB3',
      type: 'Мониторы',
      specification: 'Socket 1366',
      serialNumber: '12.3456789',
      orderId: 1,
      groupId: 1,
      userId: null,
      price: [
        { value: 2500, symbol: 'USD', isDefault: false },
        { value: 250000.5, symbol: 'UAH', isDefault: true },
      ],
      createdAt: '2017-10-06',
    }),
    product({
      id: 2,
      title: 'Gigabyte Technology X58-USB3 (Socket 1366) 6 X58-USB3',
      type: 'Мониторы',
      specification: 'Socket 1366',
      serialNumber: '12.3456790',
      orderId: 1,
      groupId: 1,
      userId: 2,
      status: 'repair',
      isNew: false,
      price: [
        { value: 100, symbol: 'USD', isDefault: false },
        { value: 2600, symbol: 'UAH', isDefault: true },
      ],
    }),
    product({
      id: 3,
      title: 'Dell UltraSharp U2415',
      type: 'Мониторы',
      specification: 'USB',
      serialNumber: 'SN-DEL-2415',
      orderId: 1,
      groupId: 2,
      userId: 3,
      price: [
        { value: 320, symbol: 'USD', isDefault: false },
        { value: 8600, symbol: 'UAH', isDefault: true },
      ],
    }),
    product({
      id: 4,
      title: 'Samsung SyncMaster 2494',
      type: 'Мониторы',
      specification: 'USB',
      serialNumber: 'SN-SAM-2494',
      orderId: 2,
      groupId: null,
      userId: null,
      isNew: false,
      price: [
        { value: 50, symbol: 'USD', isDefault: false },
        { value: 1300, symbol: 'UAH', isDefault: true },
      ],
      createdAt: '2017-09-06',
    }),
    product({
      id: 5,
      title: 'LG 24MP59G',
      type: 'Мониторы',
      specification: 'Socket 1366',
      serialNumber: 'SN-LG-2459',
      orderId: 2,
      groupId: 1,
      userId: 2,
      status: 'repair',
      price: [
        { value: 180, symbol: 'USD', isDefault: false },
        { value: 4900.25, symbol: 'UAH', isDefault: true },
      ],
    }),
    product({
      id: 6,
      title: 'Keychron K8',
      type: 'Клавиатуры',
      specification: 'USB',
      serialNumber: 'SN-KEY-0008',
      orderId: 3,
      groupId: 3,
      userId: 3,
      price: [
        { value: 90, symbol: 'USD', isDefault: false },
        { value: 3400, symbol: 'UAH', isDefault: true },
      ],
      createdAt: '2017-06-06',
    }),
    product({
      id: 7,
      title: 'Logitech MX Keys',
      type: 'Клавиатуры',
      specification: 'USB',
      serialNumber: 'SN-LOG-KEYS',
      orderId: 3,
      groupId: 3,
      userId: null,
      isNew: false,
      price: [
        { value: 110, symbol: 'USD', isDefault: false },
        { value: 4100, symbol: 'UAH', isDefault: true },
      ],
    }),
    product({
      id: 8,
      title: 'HP LaserJet Pro M404',
      type: 'Принтеры',
      specification: 'Laser',
      serialNumber: 'SN-HP-M404',
      orderId: 4,
      groupId: 2,
      userId: 2,
      price: [
        { value: 280, symbol: 'USD', isDefault: false },
        { value: 10250.5, symbol: 'UAH', isDefault: true },
      ],
      createdAt: '2017-02-06',
    }),
    product({
      id: 9,
      title: 'Epson L3250',
      type: 'Принтеры',
      specification: 'USB',
      serialNumber: 'SN-EPS-3250',
      orderId: 4,
      groupId: null,
      userId: 3,
      status: 'repair',
      price: [
        { value: 210, symbol: 'USD', isDefault: false },
        { value: 7800, symbol: 'UAH', isDefault: true },
      ],
    }),
    product({
      id: 10,
      title: 'ViewSonic VA2418-SH',
      type: 'Мониторы',
      specification: 'Socket 1366',
      serialNumber: 'SN-VS-2418',
      orderId: 5,
      groupId: 1,
      userId: 2,
      price: [
        { value: 150, symbol: 'USD', isDefault: false },
        { value: 5600, symbol: 'UAH', isDefault: true },
      ],
      createdAt: '2017-12-19',
    }),
    product({
      id: 11,
      title: 'Intel Xeon E5-2620',
      type: 'Мониторы',
      specification: 'Socket 1366',
      serialNumber: 'SN-XEON-2620',
      orderId: 6,
      groupId: 2,
      userId: null,
      isNew: false,
      price: [
        { value: 75.5, symbol: 'USD', isDefault: false },
        { value: 2800, symbol: 'UAH', isDefault: true },
      ],
      createdAt: '2017-04-12',
    }),
    product({
      id: 12,
      title: 'Kingston 16GB DDR3',
      type: 'Клавиатуры',
      specification: 'Laser',
      serialNumber: 'SN-RAM-16',
      orderId: 6,
      groupId: 2,
      userId: 3,
      price: [
        { value: 40, symbol: 'USD', isDefault: false },
        { value: 1500.25, symbol: 'UAH', isDefault: true },
      ],
    }),
  ]

  return { users, groups, orders, products }
}
