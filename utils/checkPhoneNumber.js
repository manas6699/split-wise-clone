const isValidRealisticPhoneNumber = (phone) => {
  if (!phone) return false;

  const cleaned = String(phone).replace(/\D/g, ''); // ensure it's a string

  const basicValid = /^[6-9]\d{9}$/.test(cleaned);
  if (!basicValid) return false;

  const fakeNumbers = [
    '1234567890', '9876543210', '9999999999', '8888888888',
    '7777777777', '6666666666', '0000000000', '1111111111',
    '2222222222', '3333333333', '4444444444', '5555555555'
  ];
  if (fakeNumbers.includes(cleaned)) return false;

  if (/^(\d)\1{9}$/.test(cleaned)) return false;

  const sequentialAsc = '0123456789';
  const sequentialDesc = '9876543210';
  if (sequentialAsc.includes(cleaned) || sequentialDesc.includes(cleaned)) return false;

  return true;
};

module.exports = {isValidRealisticPhoneNumber};
