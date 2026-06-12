import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, ExternalLink, CreditCard, Smartphone } from "lucide-react";
import { toast } from "sonner";

const PAYPAL_LINKS = {
  bronze: "https://www.paypal.com/paypalme/flashstream/4.99EUR",
  silver: "https://www.paypal.com/paypalme/flashstream/9.99EUR",
  gold: "https://www.paypal.com/paypalme/flashstream/14.99EUR",
  platinum: "https://www.paypal.com/paypalme/flashstream/24.99EUR",
  diamond: "https://www.paypal.com/paypalme/flashstream/49.99EUR",
};

const MBWAY_NUMBER = "+351 912 345 678";

export default function PaymentModal({ plan, onClose }) {
  const [method, setMethod] = useState(null);
  const [mbwayCopied, setMbwayCopied] = useState(false);

  if (!plan) return null;

  const handlePayPal = () => {
    const link = PAYPAL_LINKS[plan.tier] || `https://www.paypal.com/paypalme/flashstream/${plan.price_monthly}EUR`;
    window.open(link, "_blank");
    toast.success("A redirecionar para o PayPal...");
  };

  const handleMbWayCopy = () => {
    navigator.clipboard.writeText(MBWAY_NUMBER);
    setMbwayCopied(true);
    setTimeout(() => setMbwayCopied(false), 2000);
    toast.success("Número MBWay copiado!");
  };

  return (
    <Dialog open={!!plan} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-400" />
            Subscrever {plan.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Plan Summary */}
          <div className="bg-secondary rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="font-bold">{plan.name}</p>
              <p className="text-xs text-muted-foreground">Plano mensal</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-display font-bold text-primary">€{plan.price_monthly?.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">/mês</p>
            </div>
          </div>

          <p className="text-sm text-center text-muted-foreground">
            Escolhe o método de pagamento:
          </p>

          {/* Payment Methods */}
          <div className="grid grid-cols-2 gap-3">
            {/* PayPal */}
            <button
              onClick={() => setMethod("paypal")}
              className={`p-4 rounded-xl border-2 transition-all text-center space-y-2 ${
                method === "paypal" ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"
              }`}
            >
              <CreditCard className="w-8 h-8 text-blue-400 mx-auto" />
              <p className="font-bold text-sm">PayPal</p>
              <p className="text-xs text-muted-foreground">Pagamento online seguro</p>
            </button>

            {/* MBWay */}
            <button
              onClick={() => setMethod("mbway")}
              className={`p-4 rounded-xl border-2 transition-all text-center space-y-2 ${
                method === "mbway" ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"
              }`}
            >
              <Smartphone className="w-8 h-8 text-green-400 mx-auto" />
              <p className="font-bold text-sm">MBWay</p>
              <p className="text-xs text-muted-foreground">Pagamento por telemóvel</p>
            </button>
          </div>

          {/* PayPal Instructions */}
          {method === "paypal" && (
            <div className="bg-blue-400/10 border border-blue-400/20 rounded-xl p-4 space-y-3">
              <p className="text-sm font-medium text-blue-300">Instruções PayPal:</p>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal ml-4">
                <li>Clica no botão abaixo para ir ao PayPal</li>
                <li>Completa o pagamento de <strong>€{plan.price_monthly?.toFixed(2)}</strong></li>
                <li>Indica o teu username FlashStream na nota</li>
                <li>O teu VIP será ativado em até 24h</li>
              </ol>
              <Button className="w-full gap-2 bg-blue-500 hover:bg-blue-600" onClick={handlePayPal}>
                <ExternalLink className="w-4 h-4" /> Pagar com PayPal
              </Button>
            </div>
          )}

          {/* MBWay Instructions */}
          {method === "mbway" && (
            <div className="bg-green-400/10 border border-green-400/20 rounded-xl p-4 space-y-3">
              <p className="text-sm font-medium text-green-300">Instruções MBWay:</p>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal ml-4">
                <li>Abre a tua app MBWay</li>
                <li>Envia <strong>€{plan.price_monthly?.toFixed(2)}</strong> para o número abaixo</li>
                <li>Indica o teu username FlashStream na nota</li>
                <li>O teu VIP será ativado em até 24h</li>
              </ol>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-secondary rounded-lg px-3 py-2 font-mono text-sm font-bold text-center">
                  {MBWAY_NUMBER}
                </div>
                <Button size="sm" variant="outline" onClick={handleMbWayCopy} className="gap-1.5 flex-shrink-0">
                  {mbwayCopied ? "Copiado ✓" : "Copiar"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Após o pagamento, envia o comprovativo para <span className="text-primary">suporte@flashstream.pt</span>
              </p>
            </div>
          )}

          {!method && (
            <p className="text-xs text-muted-foreground text-center">
              Seleciona um método de pagamento acima
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}