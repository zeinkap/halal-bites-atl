/**
 * Generates a random Atlanta address for testing purposes
 * @returns A randomly generated Atlanta address string
 */
export function generateRandomAtlantaAddress(): string {
  const streetNumbers = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
  const streetNames = [
    'Peachtree',
    'Piedmont',
    'Ponce de Leon',
    'North Highland',
    'Monroe',
    'Howell Mill',
    'Moreland',
    'Metropolitan',
    'Memorial'
  ];
  const streetTypes = ['Road', 'Street', 'Avenue', 'Boulevard', 'Drive', 'Lane', 'Way', 'Circle'];
  const areas = ['Atlanta', 'Buckhead', 'Midtown', 'Downtown', 'Decatur', 'Sandy Springs', 'Brookhaven'];
  const zipCodes = ['30303', '30305', '30308', '30309', '30319', '30326', '30327', '30342'];

  const streetName = streetNames[Math.floor(Math.random() * streetNames.length)];
  const streetType = streetTypes[Math.floor(Math.random() * streetTypes.length)];
  const area = areas[Math.floor(Math.random() * areas.length)];
  const zipCode = zipCodes[Math.floor(Math.random() * zipCodes.length)];

  return `${streetNumbers} ${streetName} ${streetType}, ${area}, GA ${zipCode}`;
} 