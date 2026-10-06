import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-stone-900 text-stone-300 pt-10 pb-6 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 lg:px-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-10 border-b border-stone-800">
          
          {/* RENT */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-stone-400 mb-4">
              RENT
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a className="hover:text-white transition-colors" href="/rent">Verified Circular Wardrobe</a></li>
              <li><a className="hover:text-white transition-colors" href="/rent">Design Objects &amp; Furniture</a></li>
              <li><a className="hover:text-white transition-colors" href="/rent">Audio &amp; Optical Gear</a></li>
              <li><a className="hover:text-white transition-colors" href="/rent">Rental Protection Insurance</a></li>
            </ul>
          </div>

          {/* THRIFT */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-stone-400 mb-4">
              THRIFT
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a className="hover:text-white transition-colors" href="/thrift">Archival Garments</a></li>
              <li><a className="hover:text-white transition-colors" href="/thrift">Restored Leather Goods</a></li>
              <li><a className="hover:text-white transition-colors" href="/thrift">Rare Collectibles</a></li>
              <li><a className="hover:text-white transition-colors" href="/thrift">Certified Chain of Custody</a></li>
            </ul>
          </div>

          {/* ABOUT */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-stone-400 mb-4">
              ABOUT
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a className="hover:text-white transition-colors" href="#">The Circular Manifesto</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Provenance Standards</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Repair Atelier Partners</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Impact Methodology</a></li>
            </ul>
          </div>

          {/* HELP */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-stone-400 mb-4">
              HELP
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a className="hover:text-white transition-colors" href="#">Rental Concierge &amp; FAQ</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Insured Shipping Protocol</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Authentication Guarantee</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Returns &amp; Claims</a></li>
            </ul>
          </div>

          {/* ACCOUNT */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-stone-400 mb-4">
              ACCOUNT
            </h4>
            <ul className="space-y-2 text-xs">
              <li><a className="hover:text-white transition-colors" href="#">Member Overview</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Custody &amp; Active Rentals</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Saved Wardrobe</a></li>
              <li><a className="hover:text-white transition-colors" href="#">Sign Out</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <div>© 2026 ReUse Hub. Crafted for circular permanence.</div>
          <div className="flex flex-wrap items-center gap-6">
            <a className="hover:text-white transition-colors" href="#">Privacy Policy</a>
            <a className="hover:text-white transition-colors" href="#">Terms &amp; Conditions</a>
            <a className="hover:text-white transition-colors" href="#">Custody Verification</a>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 font-semibold text-[10px] tracking-wide border border-emerald-800/40">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              CERTIFIED B-CORP CIRCULAR STANDARD
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;