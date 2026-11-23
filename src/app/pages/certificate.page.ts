import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { Certificate, dateLabel } from '../core/models';
import { apiError } from '../shared/ui';
@Component({ standalone: true, imports: [RouterLink], templateUrl: './certificate.page.html', styles: [`
.certificate-toolbar{padding:30px 0;display:flex;justify-content:space-between;align-items:center}.certificate-sheet{margin:10px auto 90px;max-width:940px;background:#fff;border:16px solid #e2eee7;padding:17px;box-shadow:0 15px 65px #123b3426}.certificate-inner{min-height:580px;border:2px solid #2f8c7a;padding:40px 55px;text-align:center;position:relative;overflow:hidden}.certificate-inner:before,.certificate-inner:after{content:'✳';position:absolute;color:#e8f4e8;font-size:340px;left:-155px;bottom:-170px;z-index:0}.certificate-inner:after{left:auto;right:-150px;top:-150px;bottom:auto}.certificate-inner>*{position:relative;z-index:1}.cert-top{display:flex;align-items:center;justify-content:space-between;gap:15px;text-align:left}.cert-symbol{font-size:66px;color:#0b8071;margin:25px 0 3px}.certificate-inner h1{font-size:45px;letter-spacing:-2px;line-height:1.2;margin:17px 0;color:#143e38}.certificate-inner h2{font-family:Georgia,serif;font-size:40px;font-weight:400;font-style:italic;letter-spacing:-1px;margin:14px 0;border-bottom:1px solid #b1d9ca;display:inline-block;padding:0 38px 10px}.certificate-inner h3{font-size:22px;margin:12px 0}.certificate-inner p{color:#738783;font-size:14px;margin:10px 0}.cert-footer{border-top:1px solid #dae8e1;margin-top:40px;display:flex;justify-content:space-between;align-items:end;gap:18px;text-align:left}.cert-footer>div{display:flex;flex-direction:column;gap:7px;padding-top:17px}.cert-seal{width:66px;height:66px;border-radius:50%;display:grid!important;place-items:center;background:#137a6e;color:white;font-size:30px;padding:0!important}@media(max-width:700px){.certificate-sheet{margin:10px 15px 60px;border-width:8px;padding:7px}.certificate-inner{padding:25px 17px}.cert-top{flex-direction:column;text-align:center}.certificate-inner h1{font-size:29px}.certificate-inner h2{font-size:28px}.cert-footer{flex-wrap:wrap;font-size:11px}.cert-footer strong{max-width:220px;overflow-wrap:anywhere}}
@media print{.topbar,.site-footer,.certificate-toolbar,.mobile-links{display:none!important}.certificate-sheet{width:100%;max-width:none;margin:0;box-shadow:none;break-inside:avoid;print-color-adjust:exact;-webkit-print-color-adjust:exact}.certificate-inner{min-height:630px}@page{size:landscape;margin:8mm}}
`] })
export class CertificatePage implements OnInit {
    private readonly api = inject(ApiService);
    private readonly route = inject(ActivatedRoute);
    readonly certificate = signal<Certificate | null>(null);
    readonly error = signal('');
    readonly dateLabel = dateLabel;
    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id') || '';
        this.api.certificate(id).subscribe({ next: v => this.certificate.set(v), error: e => this.error.set(apiError(e)) });
    }
    print() {
        window.print();
    }
}
