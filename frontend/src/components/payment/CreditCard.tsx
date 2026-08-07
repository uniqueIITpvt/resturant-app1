import { Wifi } from 'lucide-react';

interface CreditCardProps {
  cardNumber?: string;
  cardHolder?: string;
  expiryDate?: string;
}

export default function CreditCard({
  cardNumber = '9759 2484 5269 6576',
  cardHolder = 'JOHN DOE',
  expiryDate = '12/24',
}: CreditCardProps) {
  return (
    <div className='flip-card'>
      <div className='flip-card-inner'>
        <div className='flip-card-front'>
          <p className='heading_8264'>MASTERCARD</p>
          {/* Mastercard Logo */}
          <div className='logo'>
            <div className='flex'>
              <div className='w-6 h-6 bg-[#ff9800] rounded-full -mr-3'></div>
              <div className='w-6 h-6 bg-[#d50000] rounded-full opacity-80'></div>
            </div>
          </div>

          {/* EMV Chip */}
          <div className='chip'>
            <div className='w-8 h-6 bg-yellow-200 rounded-md grid grid-cols-3 grid-rows-3 p-[2px] transform rotate-90'>
              <div className='bg-yellow-600'></div>
              <div className='bg-yellow-600'></div>
              <div className='bg-yellow-600'></div>
            </div>
          </div>

          {/* Contactless Symbol */}
          <div className='contactless'>
            <Wifi className='w-5 h-5 text-white transform -rotate-90' />
          </div>

          <p className='number'>{cardNumber}</p>
          <div className='valid-holder'>
            <div>
              <p className='valid_thru'>VALID THRU</p>
              <p className='date_8264'>{expiryDate}</p>
            </div>
          </div>
          <p className='name'>{cardHolder}</p>
        </div>
        <div className='flip-card-back'>
          <div className='strip'></div>
          <div className='mstrip'></div>
          <div className='sstrip'>
            <p className='code'>***</p>
          </div>
        </div>
      </div>
    </div>
  );
}
