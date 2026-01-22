import UIKit
import Capacitor

/// Custom bridge VC - just sets the native background color to match the app.
/// The WebView stays full screen; CSS handles safe area padding.
class BridgeViewController: CAPBridgeViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        // Set background to grey (#f9fafb = Tailwind bg-gray-50) 
        // This shows through the safe area regions (status bar, home indicator)
        view.backgroundColor = UIColor(red: 249/255, green: 250/255, blue: 251/255, alpha: 1.0)
    }
}
