(function(){
	var g_pCamera_ = NULL;//CCursorCamera
	window.getCamera =function () {
		return g_pCamera_;
	};
	window.CCursorCamera = CCursorCamera;
	CCursorCamera.prototype = Object.create(NewCamera.prototype);
	CCursorCamera.prototype.constructor = CCursorCamera;
	function CCursorCamera(pDevice, type/*= THIRD*/) {
		//////////////////////////////////////////////////////////////////////////
		NewCamera.call(this, null);
		g_pCamera_ = this;
		var m_bMouseDown = false, m_bCurShow = true, m_draged = false, m_height = 30.0, m_ptDown =new THREE.Vector2(), m_pSource = null;
	
		var angleX = D3DX_PI / getViewport().width * 0.5;
		if (type) {
			g_pCamera_ = this;
			m_bMouseDown = false;
			m_bCurShow = true;
			m_draged = false;
			m_height = 60.0;
			angleX = D3DX_PI / getViewport().width * 0.5;
		}
		var m_position = this.position;
		var _this = this;
		document.addEventListener('mousedown', function(event) {
			_this.handleMessage((event.button == 2) ? WM_RBUTTONDOWN
					: WM_LBUTTONDOWN, event, event);
		}, false);
		document.addEventListener('mouseup', function(event) {
			_this.handleMessage((event.button == 2) ? WM_RBUTTONUP : WM_LBUTTONUP,
					event, event);
		}, false);
		document.addEventListener('mousemove', function(event) {
			_this.handleMessage(WM_MOUSEMOVE, event, event);
		}, false);
		document.addEventListener('mouseleave', function(event) {
			_this.handleMessage(WM_MOUSELEAVE, event, event);
		}, false);
		document.addEventListener('mousewheel', function(event) {
			var deltaY = event.deltaY * 0.02;
			_this.handleMessage(WM_MOUSEWHEEL, event, event);
		});
		this.handleMessage = function(msg, wParam, lParam) {
			if (msg == WM_LBUTTONDOWN || msg == WM_RBUTTONDOWN) {
				m_bMouseDown = true;
				m_ptDown.set(lParam.pageX, lParam.pageY);
				m_draged = false;
			} else if (msg == WM_LBUTTONUP || msg == WM_RBUTTONUP) {
				m_bMouseDown = false; //m_draged=0;
				if (!m_bCurShow) {
					this.showCursor(true);
					return 1;
				}
			} else if (msg == WM_MOUSEMOVE) {
				if (m_bMouseDown
						&& (m_ptDown.x - lParam.pageX > 4 || m_ptDown.y
								- lParam.pageY > 4)) {
					m_draged = 1;
					this.drag(new THREE.Vector2(lParam.pageX, lParam.pageY));
					return 1;
				}
			} else if (msg == WM_MOUSELEAVE) {
				m_bMouseDown = false; // m_draged=0;
			} else if (msg == WM_MOUSEWHEEL) {
				var zDelta = wParam.deltaY * 0.02;
				var dt = (m_distMax - m_distMin) / 10.0;
				if (zDelta < 0) {
					this.m_fDistToPlayer += dt;
				} else if (zDelta > 0) {
					this.m_fDistToPlayer -= dt;
				}
				this.correctDist();
				return 1;
			}
			return 0;
		}
		this.drag = drag;
		var v2_1 = new THREE.Vector2(), v3_1 = new THREE.Vector3();
		function drag(pt) {
			if (pt.equals(m_ptDown)) return;
			v2_1.copy(pt).sub(m_ptDown);
			this.rotYaw(v2_1.x * m_curSpeedX);
			this.rotPitch(v2_1.y * m_curSpeedY);
			//    this.showCursor(false);
			m_draged = true;
			//getApp().setCursorPos(m_ptDown);
		}
		this.isDraged = function() {
			return m_draged
		};
		this.setSource = function(e) {
			m_pSource = e;
		};
		var _super_update = this.update;
		this.update = function(fElapse) {
			_super_update.call(this, fElapse);
	
			if (!m_pSource || this.getCameraType() === 'FREE') {
				//RefPtr keyboard = getApp().getKeyboard();
				//左右旋转
				if (keyboard.pressed('A')) {
					this.rotYaw(-3.14 * fElapse);
				} else if (keyboard.pressed('D')) {
					this.rotYaw(3.14 * fElapse);
				}
				//前进后退
				if (keyboard.pressed('W')) {
					this.moveLook(true);
				} else if (keyboard.pressed('S')) {
					this.moveLook(false);
				}
				return;
			}
	
			//摄像机跟随
			var vecPos = m_pSource.position;//D3DXVECTOR3
			//vecPos.y += m_height;
			if (this.getCameraType() == CCamera.FIRST) {
				//        m_pSource.setLook(m_look);
				//        m_pSource.setUp(m_up);
				//        m_pSource.setRight(m_right);
				m_pSource.quaternion.copy(this.quaternion);
				m_position.copy(vecPos);
				m_position.y += m_height;
			} else if (this.getCameraType() == CCamera.THIRD) {
	
				var length = v3_1.subVectors(vecPos, m_position).length()
						- this.m_fDistToPlayer;
				m_position.subVectors(vecPos, v3_1.copy(this.look)
						.multiplyScalar(
								this.m_fDistToPlayer + length * (1.0 - 0.8 * fElapse)));
			}
	
			if (0) {
				var pMap = getMap();
				if (pMap) {
					var h = pMap.getHeight(m_position.x, m_position.z) + 10.0;
					if (m_position.y < h) {
						m_position.y = h;
					}
				}
			}
		}
	
		this.setCurRoSpeed = function(speed) {
			m_curSpeedX = speed;
			m_curSpeedY = speed;
	
		}
	
		this.showCursor = function(show) {
			if (show == m_bCurShow) {
				return;
			}
			m_bCurShow = show;
			ShowCursor(show);
		}
	
		this.setCurRoSpeed(angleX);
	}
})();
////////////////////////////////////
//var camera = new CCursorCamera(CCamera.THIRD);
