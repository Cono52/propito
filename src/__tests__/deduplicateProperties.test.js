const deduplicateProperties = require('../deduplicateProperties')

const mockData = [
  {
    link:
      'https://www.zoopla.co.uk/to-rent/details/11111111?search_identifier=1p1p1p1p1p1p1p1p1p1p1p1p1p1p1p',
    price: '£1,733 pcm (£400 pw)',
    desc:
      'Tired of scrolling through pages and pages of property ads? Well your searh ends here! Prop1 are proud to present this fully furnished luxury apartment at the much sought after TEST development.',
    listed: 'Listed on 12th Feb 2019 by',
    company: 'Prop1 - FlippoLand'
  },
  {
    link:
      'https://www.zoopla.co.uk/to-rent/details/11111111?search_identifier=1p1p1p1p1p1p1p1p1p1p1p1p1p1p1p',
    price: '£2,000 pcm (£462 pw)',
    desc:
      '**Winner of the ‘Best Residential High-Rise Architecture’ accolade by the International Property Awards 2017** OneClickHomes have the pleasure of presenting this stunning 1 bedroom, 2 bathroom apartment set on the 4th floor to the prestigious ...',
    listed: 'Listed on 9th Feb 2019 by',
    company: 'propcomp6'
  },
  {
    link:
      'https://www.zoopla.co.uk/to-rent/details/11111111?search_identifier=1p1p1p1p1p1p1p1p1p1p1p1p1p1p1p',
    price: '£2,210 pcm (£510 pw)',
    desc:
      'A delightful south-facing fully furnished one bedroom, one bathroom apartment on the 41th floor of AT, a landmark development a short walk from the very heart of FlippoLand. The apartme... ** Property Reference: 492180 **',
    listed: 'Listed on 8th Feb 2019 by',
    company: 'opopopop'
  },
  {
    link:
      'https://www.zoopla.co.uk/to-rent/details/11111111?search_identifier=1p1p1p1p1p1p1p1p1p1p1p1p1p1p1p',
    price: '£1,733 pcm (£400 pw)',
    desc:
      'Available now! Situated at the end of the hallway on the third floor of the highly desirable, dockside development, TEST, is this very well-appointed one bed apartment.',
    listed: 'Listed on 4th Feb 2019 by',
    company: 'Prop2Comp'
  },
  {
    link:
      'https://www.zoopla.co.uk/to-rent/details/11111111?search_identifier=1p1p1p1p1p1p1p1p1p1p1p1p1p1p1p',
    price: '£1,430 pcm (£330 pw)',
    desc:
      'A furnished studio suite located in this fabulous dockside development. The suite boasts separate sleeping and living areas, a fully fitted kitchen, contemporary shower room and private balcony with north facing views. Residents also benefit 24 hour ...',
    listed: 'Listed on 1st Feb 2019 by',
    company: 'propcomp5'
  },
  {
    link:
      'https://www.zoopla.co.uk/to-rent/details/11111111?search_identifier=1p1p1p1p1p1p1p1p1p1p1p1p1p1p1p',
    price: '£1,450 pcm (£335 pw)',
    desc:
      'Beautifully presented furnished 366sqft studio suite apartment situated on the thirteenth forth floor of the stunning Baltimore Tower development with balcony facing South. Residents will benefit from amazing on site facilities. Conveniently located a ...',
    listed: 'Listed on 28th Jan 2019 by',
    company: 'Sab - Saint Andrews Bureau Ltd, EC3A'
  },
  {
    link:
      'https://www.zoopla.co.uk/to-rent/details/11111111?search_identifier=1p1p1p1p1p1p1p1p1p1p1p1p1p1p1p',
    price: '£1,712 pcm (£395 pw)',
    desc:
      "A luxury one bedroom apartment set within TEST's North Boulevard. This furnished apartment includes a large, inviting living space, fitted kitchen with integrated appliances, wood flooring, full length windows, fitted bedroom storage, ...",
    listed: 'Listed on 25th Jan 2019 by',
    company: 'propcomp5'
  },
  {
    link:
      'https://www.zoopla.co.uk/to-rent/details/11111111?search_identifier=1p1p1p1p1p1p1p1p1p1p1p1p1p1p1p',
    price: '£1,365 pcm (£315 pw)',
    desc:
      'A furnished studio suite apartment set on the ground floor in this sought after dockside development. Offering fantastic features including fully integrated kitchen, private balcony. Residents have access to a 24 hour concierge and gym. Ideally ...',
    listed: 'Listed on 22nd Jan 2019 by',
    company: 'propcomp5'
  },
  {
    link:
      'https://www.zoopla.co.uk/to-rent/details/11111111?search_identifier=1p1p1p1p1p1p1p1p1p1p1p1p1p1p1p',
    price: '£1,690 pcm (£390 pw)',
    desc:
      'Stunning one bedroom apartment positioned on the second floor of this landmark of luxury living. This accommodation offers stylish living space leading to a private balcony, boasting a bespoke open plan designer kitchen, brilliantly designed and proportio',
    listed: 'Listed on 17th Jan 2019 by',
    company: 'Moving City'
  },
  {
    link: 'https://www.rightmove.co.uk/property-to-rent/property-11111111.html',
    price: '£1,733 pcm\n£400 pw (fees apply)',
    desc:
      'Tired of scrolling through pages and pages of property ads? Well your searh ends here! Prop1 are proud to present this fully furnished luxury apartment at the much sought after TEST development.',
    listed: 'Added on 12/02/2019',
    company: 'Prop1, FlippoLand Office - Lettings'
  },
  {
    link: 'https://www.rightmove.co.uk/property-to-rent/property-11111111.html',
    price: '£2,000 pcm\n£462 pw (fees apply)',
    desc:
      '**Winner of the ‘Best Residential High-Rise Architecture’ accolade by the International Property Awards 2017** OneClickHomes have the pleasure of presenting this stunning 1 bedroom, 2 bathroom apartment set on the 4th floor to the prestigious TEST Development that benefi...',
    listed: 'Added on 09/02/2019',
    company: 'PropComp4'
  },
  {
    link: 'https://www.rightmove.co.uk/property-to-rent/property-11111111.html',
    price: '£1,733 pcm\n£400 pw (fees apply)',
    desc:
      'AVAILABLE NOW! Situated at the end of the hallway on the third floor of the highly desirable, dockside development, TEST, is this very well-appointed one bed apartment.',
    listed: 'Added on 04/02/2019',
    company: 'Prop2Comp, London'
  },
  {
    link: 'https://www.rightmove.co.uk/property-to-rent/property-11111111.html',
    price: '£1,430 pcm\n£330 pw (fees apply)',
    desc:
      'A furnished studio suite located in this fabulous dockside development. The suite boasts separate sleeping and living areas, a fully fitted kitchen, contemporary shower room and private balcony with north facing views. Residents also benefit 24 hour concierge service and access to extensive leisu...',
    listed: 'Added on 01/02/2019',
    company: 'PropComp3'
  },
  {
    link: 'https://www.rightmove.co.uk/property-to-rent/property-11111111.html',
    price: '£1,712 pcm\n£395 pw (fees apply)',
    desc:
      'A luxury one bedroom apartment set within TEST’s North Boulevard. This furnished apartment includes a large, inviting living space, fitted kitchen with integrated appliances, wood flooring, full length windows, fitted bedroom storage, stylish bathroom suite and access to a private, lan...',
    listed: 'Added on 25/01/2019',
    company: 'PropComp3'
  },
  {
    link: 'https://www.rightmove.co.uk/property-to-rent/property-11111111.html',
    price: '£1,365 pcm\n£315 pw (fees apply)',
    desc:
      "A furnished studio suite apartment set on the ground floor in this sought after dockside development. Offering fantastic features including fully integrated kitchen, private balcony. Residents have access to a 24 hour concierge and gym. Ideally located close to both DippDopp and FlippoLand'...",
    listed: 'Added on 22/01/2019',
    company: 'PropComp3'
  },
  {
    link: 'https://www.rightmove.co.uk/property-to-rent/property-11111111.html',
    price: '£1,690 pcm\n£390 pw (fees apply)',
    desc:
      'Stunning one bedroom apartment positioned on the second floor of this landmark of luxury living. This accommodation offers stylish living space leading to a private balcony, boasting a bespoke open-plan designer kitchen, brilliantly designed and proportioned one bedroom and a contemporary bathroo...',
    listed: 'Added on 17/01/2019',
    company: 'Moving City'
  }
]

test('should be 9 unique properties all from zoopla', () => {
  const results = deduplicateProperties(mockData)
  expect(results.length).toBe(9)
  expect(!!results.find(item => item.link.includes('rightmove'))).toBe(false)
})
