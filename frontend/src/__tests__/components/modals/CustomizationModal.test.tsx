import { render, screen, fireEvent } from '@testing-library/react';
import CustomizationModal from '@/components/modals/CustomizationModal';
import '@testing-library/jest-dom';

// Mock data for testing
const mockMenuItem = {
  _id: 'item123',
  name: 'Deluxe Burger',
  description: 'A juicy burger with all the fixings',
  price: 12.99,
  category: 'Burgers',
  image: {
    url: '/images/burger.jpg',
  },
  isPopular: true,
  isVegetarian: false,
};

const mockAddonGroups = [
  {
    title: 'Cheese Options',
    required: true,
    options: [
      { name: 'American Cheese', price: 1.5, selected: true },
      { name: 'Swiss Cheese', price: 2.0, selected: false },
      { name: 'Cheddar Cheese', price: 1.5, selected: false },
    ],
  },
  {
    title: 'Toppings',
    required: false,
    options: [
      { name: 'Bacon', price: 2.5, selected: false },
      { name: 'Mushrooms', price: 1.5, selected: false },
      { name: 'Avocado', price: 2.0, selected: false },
    ],
  },
];

describe('CustomizationModal Component', () => {
  // Common props for testing
  const mockProps = {
    isOpen: true,
    onClose: jest.fn(),
    item: mockMenuItem,
    selectedAddons: mockAddonGroups,
    setSelectedAddons: jest.fn(),
    totalPrice: 14.49, // Base price + American Cheese
    onAddToCart: jest.fn(),
    validateSelections: jest.fn().mockReturnValue(true),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <CustomizationModal {...mockProps} isOpen={false} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the modal when isOpen is true', () => {
    render(<CustomizationModal {...mockProps} />);

    expect(screen.getByText('Deluxe Burger')).toBeInTheDocument();
    expect(screen.getByText('Customize Your Order')).toBeInTheDocument();
    expect(screen.getByText('Cheese Options')).toBeInTheDocument();
    expect(screen.getByText('Toppings')).toBeInTheDocument();
  });

  it('shows required label for required addon groups', () => {
    render(<CustomizationModal {...mockProps} />);

    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('displays addon options with prices', () => {
    render(<CustomizationModal {...mockProps} />);

    // Check if all cheese options are displayed
    expect(screen.getByText('American Cheese')).toBeInTheDocument();
    expect(screen.getAllByText('+$1.50')[0]).toBeInTheDocument();
    expect(screen.getByText('Swiss Cheese')).toBeInTheDocument();
    expect(screen.getAllByText('+$2.00')[0]).toBeInTheDocument();

    // Check if all topping options are displayed
    expect(screen.getByText('Bacon')).toBeInTheDocument();
    expect(screen.getByText('+$2.50')).toBeInTheDocument();
    expect(screen.getByText('Mushrooms')).toBeInTheDocument();
    // There are multiple +$1.50 elements, so we check that at least one exists
    expect(screen.getAllByText('+$1.50').length).toBeGreaterThan(0);
  });

  it('shows the correct total price', () => {
    render(<CustomizationModal {...mockProps} />);

    expect(screen.getByText('$14.49')).toBeInTheDocument();
  });

  it('calls setSelectedAddons when clicking a radio option in a required group', () => {
    const setSelectedAddonsMock = jest.fn();
    render(
      <CustomizationModal
        {...mockProps}
        setSelectedAddons={setSelectedAddonsMock}
      />
    );

    // Click on Swiss Cheese option
    fireEvent.click(screen.getByText('Swiss Cheese'));

    expect(setSelectedAddonsMock).toHaveBeenCalled();
  });

  it('calls setSelectedAddons when clicking a checkbox option in a non-required group', () => {
    const setSelectedAddonsMock = jest.fn();
    render(
      <CustomizationModal
        {...mockProps}
        setSelectedAddons={setSelectedAddonsMock}
      />
    );

    // Click on Bacon option
    fireEvent.click(screen.getByText('Bacon'));

    expect(setSelectedAddonsMock).toHaveBeenCalled();
  });

  it('has an enabled Add to Cart button when selections are valid', () => {
    render(<CustomizationModal {...mockProps} />);

    const addToCartButton = screen.getByText('Add to Cart');
    expect(addToCartButton).not.toBeDisabled();
    expect(addToCartButton).toHaveClass('bg-amber-500');
  });

  it('has a disabled Add to Cart button when selections are invalid', () => {
    render(
      <CustomizationModal
        {...mockProps}
        validateSelections={jest.fn().mockReturnValue(false)}
      />
    );

    const addToCartButton = screen.getByText('Add to Cart');
    expect(addToCartButton).toBeDisabled();
    expect(addToCartButton).toHaveClass('bg-gray-300');
  });

  it('calls onAddToCart when Add to Cart button is clicked', () => {
    const onAddToCartMock = jest.fn();
    render(<CustomizationModal {...mockProps} onAddToCart={onAddToCartMock} />);

    fireEvent.click(screen.getByText('Add to Cart'));

    expect(onAddToCartMock).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when clicking the X button', () => {
    const onCloseMock = jest.fn();
    render(<CustomizationModal {...mockProps} onClose={onCloseMock} />);

    fireEvent.click(screen.getByRole('button', { name: '' })); // X button

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('renders radio buttons for required addon groups', () => {
    render(<CustomizationModal {...mockProps} />);

    // The radio options should be in the first addon group (Cheese Options)
    const cheeseOptionsSection = screen
      .getByText('Cheese Options')
      .closest('div')?.parentElement;
    const radioElements =
      cheeseOptionsSection?.querySelectorAll('.rounded-full');

    expect(radioElements?.length).toBeGreaterThan(0);
  });

  it('renders checkboxes for non-required addon groups', () => {
    render(<CustomizationModal {...mockProps} />);

    // The checkbox options should be in the second addon group (Toppings)
    const toppingsSection = screen
      .getByText('Toppings')
      .closest('div')?.parentElement;
    const checkboxElements = toppingsSection?.querySelectorAll(
      '.rounded:not(.rounded-full)'
    );

    expect(checkboxElements?.length).toBeGreaterThan(0);
  });

  it('shows selected state for pre-selected options', () => {
    render(<CustomizationModal {...mockProps} />);

    // Find the American Cheese option which should be pre-selected
    const americanCheeseOption = screen
      .getByText('American Cheese')
      .closest('div')?.parentElement;
    const selectedIndicator =
      americanCheeseOption?.querySelector('.bg-amber-500');

    expect(selectedIndicator).toBeInTheDocument();
  });
});
