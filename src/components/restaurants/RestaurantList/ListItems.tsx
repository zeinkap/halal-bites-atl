import React from 'react';
import { Restaurant } from '@/types';
import RestaurantCard from '../../cards/RestaurantCard';

interface RestaurantListItemsProps {
  restaurants: Restaurant[];
  lastRestaurantRef: (node: HTMLDivElement) => void;
}

const RestaurantListItems: React.FC<RestaurantListItemsProps> = ({ restaurants, lastRestaurantRef }) => (
  <div className="space-y-4" data-testid="restaurant-list-items-section">
    {restaurants.map((restaurant, index) => (
      <div
        key={restaurant.id}
        ref={index === restaurants.length - 1 ? lastRestaurantRef : undefined}
        data-testid={`restaurant-list-item-${restaurant.id}`}
      >
        <RestaurantCard restaurant={restaurant} />
      </div>
    ))}
  </div>
);

export default RestaurantListItems; 