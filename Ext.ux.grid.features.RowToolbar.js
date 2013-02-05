/*
Copyright 2013 Siterra Ltd. (www.siterra.org)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

*/

Ext.define('Ext.ux.grid.features.RowToolbar', {
    extend: 'Ext.grid.feature.Feature',
    alias: 'feature.rowtoolbar',
    
    rowToolbarCls: 'app-grid-feature-rowtoolbar',
    
    toolbar: {},
    
    init: function() {
        this.toolbar = Ext.applyIf(this.toolbar, {
            xclass: 'Ext.toolbar.Toolbar',
            padding: '0 16 0 0',
            cls: 'grid-feature-rowtoolbar-instance',
            baseCls: '',
            baseId: Ext.id() + '-rowtoolbar',
            
            /* @optional
             * @param isDisabledForRecord (function)
             * Function gives a record to check enable item or not for it
             * inputs
             * @param record
             * @return boolean
             */
            
            /* @optional
             * @param isVisibleForRecord (function)
             * Function gives a record to check visibility of item
             * inputs
             * @param record
             * @return boolean
             */
            
            /* @optional
             * @param hiddenItemsSavePosition (boolean)
             * With this flag is true and element is hidden, then it's width
             * doesn't 0. Visibility doesn't influence on positioning othe items.
             */
            
            listeners: {
                scope: this,
                afterrender: function(tbar) {
                    Ext.each(tbar.items.items, function(item) {
                        if (item.isDisabledForRecord) {
                            var is_disabled = item.isDisabledForRecord(item, tbar.record);
                            item.setDisabled(is_disabled);
                        }
                        if (item.isVisibleForRecord) {
                            var is_visible = item.isVisibleForRecord(item, tbar.record);
                            if (item.hiddenItemsSavePosition) {
                                item.getEl().dom.style.visibility = (is_visible ? 'visible' : 'hidden');
                            } else {
                                item.setVisible(is_visible);
                            }
                        }
                    }, this);
                }
            }
            /* @variable renderedItems 
             * Keeps rendered components created with help of this toolbar config
             */
                /* each renderedItem has
                 * @variable record 
                 * what links to it's own record in store
                 * Keeps rendered components created with help of this toolbar config
                 */
        });
    },
    
    renderItems: function() {
        this.toolbar.renderedItems = [];
        var els = Ext.query('.'+ this.toolbar.baseId +'-wrap', this.grid.getEl().dom);
        Ext.each(els, function(el) {
            // clone toolbar config for each row
            var tb_clone = Ext.clone(this.toolbar);
            tb_clone.items = Ext.clone(this.items);
            
            // find record in store for current row
            var row = Ext.get(el).up('.x-grid-row');
            if (row) {
                tb_clone.record = this.grid.getView().getRecord(row);
            }
            
            // create and render toolbar for current row
            tb_clone = Ext.create(tb_clone);
            el.innerHTML = '';
            tb_clone.render(el);
            
            // remember an item
            this.toolbar.renderedItems.push(tb_clone);
        }, this);
    },
    
    getRowToolbar: function() {
        var tpl = 
            '<tr class="'+ this.rowToolbarCls +'">'+
                '<td class="'+ this.rowToolbarCls +'" colspan="{[ this.embedColSpan() ]}">'+
                    '<div class="'+ this.toolbar.baseId +'-wrap '+ this.rowToolbarCls +'-btn"></div>'+
                '</td>'+
            '</tr>';
        
        return tpl;
    },

    embedColSpan: function() {
        return '{rowToolbarColspan}';
    },
    
    getAdditionalData: function(data, idx, record, orig) {
        var colspan = this.view.headerCt.getColumnCount();
        return {
            rowToolbarCls: this.rowToolbarCls,
            rowToolbarColspan: colspan
        };
    },
    
    mutateMetaRowTpl: function(metaRowTpl) {
        metaRowTpl.push(this.getRowToolbar());
    },

    getMetaRowTplFragments: function() {
        // render toolbar after some time
        Ext.defer(this.renderItems, 50, this);
        
        return {
            embedFullWidth: this.embedFullWidth,
            embedColSpan: this.embedColSpan
        };
    }
});
