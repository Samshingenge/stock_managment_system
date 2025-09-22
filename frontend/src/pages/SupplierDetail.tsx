import React from 'react';
import { useParams } from 'react-router-dom';

const SupplierDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Supplier Details</h1>
          <p className="page-subtitle">Supplier ID: {id}</p>
        </div>
      </div>
      
      <div className="card p-6">
        <p className="text-gray-500 text-center py-8">
          Supplier detail view will be implemented here...
        </p>
      </div>
    </div>
  );
};

export default SupplierDetail;