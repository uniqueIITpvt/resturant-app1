import { render, screen, fireEvent, act } from '@testing-library/react';
import CouponDetailsModal from '@/components/modals/CouponDetailsModal';
import '@testing-library/jest-dom';

// Mock data for testing
const mockCoupon = {
  _id: 'coupon123',
  code: 'SUMMER25',
  description: 'Summer discount on all menu items',
  discountType: 'percentage' as const,
  discountValue: 25,
  minOrderValue: 50,
  maxDiscountAmount: 100,
  startDate: '2023-06-01T00:00:00.000Z',
  endDate: '2023-08-31T23:59:59.000Z',
  isActive: true,
  usageLimit: 1000,
  usedCount: 250,
  userLimit: 1,
};

// Mock the document body style for testing
Object.defineProperty(document.body, 'style', {
  value: {
    overflow: '',
  },
  writable: true,
});

describe('CouponDetailsModal Component', () => {
  beforeEach(() => {
    // Reset mocks and clear timers
    jest.useFakeTimers();
    jest.clearAllMocks();
    document.body.style.overflow = '';
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders nothing when coupon is null', () => {
    const { container } = render(
      <CouponDetailsModal coupon={null} onClose={jest.fn()} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the modal when coupon is provided', () => {
    render(<CouponDetailsModal coupon={mockCoupon} onClose={jest.fn()} />);

    expect(screen.getByText('Coupon Details')).toBeInTheDocument();
    expect(screen.getByText('SUMMER25')).toBeInTheDocument();
    expect(screen.getByText('25% off')).toBeInTheDocument();
    expect(screen.getByText('(max: $100)')).toBeInTheDocument();
    expect(screen.getByText('$50')).toBeInTheDocument();
    expect(
      screen.getByText('Summer discount on all menu items')
    ).toBeInTheDocument();
  });

  it('displays percentage discount correctly', () => {
    render(<CouponDetailsModal coupon={mockCoupon} onClose={jest.fn()} />);

    expect(screen.getByText('25% off')).toBeInTheDocument();
    expect(screen.getByText('(max: $100)')).toBeInTheDocument();
  });

  it('displays fixed discount correctly', () => {
    const fixedDiscountCoupon = {
      ...mockCoupon,
      discountType: 'fixed' as const,
      discountValue: 10,
      maxDiscountAmount: null,
    };

    render(
      <CouponDetailsModal coupon={fixedDiscountCoupon} onClose={jest.fn()} />
    );

    expect(screen.getByText('$10 off')).toBeInTheDocument();
    expect(screen.queryByText(/max:/i)).not.toBeInTheDocument();
  });

  it('displays active status correctly', () => {
    render(<CouponDetailsModal coupon={mockCoupon} onClose={jest.fn()} />);

    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('displays inactive status correctly', () => {
    const inactiveCoupon = { ...mockCoupon, isActive: false };

    render(<CouponDetailsModal coupon={inactiveCoupon} onClose={jest.fn()} />);

    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('formats dates correctly', () => {
    render(<CouponDetailsModal coupon={mockCoupon} onClose={jest.fn()} />);

    // The Date format depends on locale settings, so we'll just test that the
    // "Valid Period" label is present and its value contains a dash for the date range
    expect(screen.getByText('Valid Period')).toBeInTheDocument();

    // Get the date element which is a sibling of the "Valid Period" label
    const validPeriodLabel = screen.getByText('Valid Period');
    const dateElement =
      validPeriodLabel.parentElement?.querySelector('.font-semibold');
    expect(dateElement).toBeInTheDocument();
    expect(dateElement?.textContent).toContain('-'); // Should have a dash between dates
  });

  it('displays usage information correctly', () => {
    render(<CouponDetailsModal coupon={mockCoupon} onClose={jest.fn()} />);

    expect(screen.getByText('250 used (Limit: 1000)')).toBeInTheDocument();
  });

  it('displays user limit correctly', () => {
    render(<CouponDetailsModal coupon={mockCoupon} onClose={jest.fn()} />);

    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const onCloseMock = jest.fn();
    render(<CouponDetailsModal coupon={mockCoupon} onClose={onCloseMock} />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    // Wait for animation timeout
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(onCloseMock).toHaveBeenCalled();
  });

  it('calls onClose when X button is clicked', async () => {
    const onCloseMock = jest.fn();
    render(<CouponDetailsModal coupon={mockCoupon} onClose={onCloseMock} />);

    const xButton = screen.getByRole('button', { name: '' });
    fireEvent.click(xButton);

    // Wait for animation timeout
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(onCloseMock).toHaveBeenCalled();
  });

  it('adds overflow: hidden to body when modal opens', () => {
    render(<CouponDetailsModal coupon={mockCoupon} onClose={jest.fn()} />);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restores body overflow when modal unmounts', () => {
    const { unmount } = render(
      <CouponDetailsModal coupon={mockCoupon} onClose={jest.fn()} />
    );

    unmount();
    expect(document.body.style.overflow).toBe('unset');
  });

  it('handles clicking outside the modal', () => {
    const onCloseMock = jest.fn();
    render(<CouponDetailsModal coupon={mockCoupon} onClose={onCloseMock} />);

    // Simulate a MouseDown event outside the modal
    const event = new MouseEvent('mousedown', { bubbles: true });
    document.dispatchEvent(event);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(onCloseMock).toHaveBeenCalled();
  });

  it('handles escape key press', () => {
    const onCloseMock = jest.fn();
    render(<CouponDetailsModal coupon={mockCoupon} onClose={onCloseMock} />);

    // Simulate an Escape keydown event
    const event = new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
    });
    document.dispatchEvent(event);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(onCloseMock).toHaveBeenCalled();
  });
});
